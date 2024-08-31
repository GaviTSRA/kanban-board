<script setup lang="ts">
import type { Board, Card, InfoItem, Label, List } from "~/types";
import { useConnection } from "@/stores";
const ws = useConnection();

const props = defineProps<{
  board: Board;
  lists: List[];
  cards: { [listId: string]: Card[] };
  labels: Label[];
  assignedLabels: { [labelId: string]: string };
  allLists: List[] | undefined;
  infoItems: InfoItem[];
}>();

let newListName = ref("");
function createNewList() {
  if (newListName.value == "") return;
  ws.createList(props.board.id, newListName.value, props.lists.length);
  newListName.value = "";
}

let dragging = ref(false);
let draggingList: List | undefined = undefined;
function startDrag(list: List) {
  draggingList = list;
  dragging.value = false;
  dragging.value = true;
}

let isDraggingCard = ref(false);
let draggingCard: Card | undefined = undefined;
function startDragCard(card: Card) {
  isDraggingCard.value = false;
  isDraggingCard.value = true;
  draggingCard = card;
}

function drop(index: number) {
  if (!draggingList) return;

  if (draggingList.position < index) index -= 1;
  if (index < 0) index = 0;
  dragging.value = false;
  ws.updateListPosition(draggingList?.id, index);

  for (let list of props.lists) {
    if (list.id == draggingList?.id) continue;
    if (list.position < draggingList.position && list.position >= index) {
      ws.updateListPosition(list.id, (list.position += 1));
    }
    if (list.position > draggingList.position && list.position <= index) {
      ws.updateListPosition(list.id, (list.position -= 1));
    }
  }
}

let moveQueue: Ref<Card[]> = ref([]);
let listDroppedIn: Ref<{ [id: string]: List }> = ref({});
let indexDroppedIn: Ref<{ [id: string]: number }> = ref({});
let subcards: Ref<{ [id: string]: Card[] }> = ref({});
function dropCard(list: List, index: number) {
  if (!draggingCard) return;
  let droppedList = list;

  let i = 0;
  for (let card of props.cards[droppedList.id]) {
    if (card.boardId == draggingCard.boardId) {
      index -= i;
      break;
    }
    i++;
  }

  if (index < 0) return;

  if (draggingCard?.position < index && draggingCard?.listId == list.id)
    index -= 1;
  if (index < 0) index = 0;
  isDraggingCard.value = false;
  ws.updateCardList(draggingCard?.id, list.id);
  ws.updateCardPosition(draggingCard?.id, index);

  if (draggingCard?.listId != list.id) {
    for (let card of props.cards[draggingCard?.listId]) {
      if (card.id == draggingCard?.id) continue;
      if (card.position > draggingCard?.position) {
        ws.updateCardPosition(card.id, card.position - 1);
      }
    }
  }
  for (let card of props.cards[list.id]) {
    if (card.id == draggingCard?.id) continue;
    if (
      (card.listId == draggingCard?.listId &&
        card.position < draggingCard?.position &&
        card.position >= index) ||
      (list.id != draggingCard?.listId && card.position >= index)
    ) {
      ws.updateCardPosition(card.id, card.position + 1);
    }
    if (
      list.id == draggingCard?.listId &&
      card.position > draggingCard?.position &&
      card.position <= index
    ) {
      ws.updateCardPosition(card.id, card.position - 1);
    }
  }

  let _subcards = [];
  for (let list of props.lists) {
    for (let otherCard of props.cards[list.id]) {
      if (otherCard.cardId == draggingCard?.id) _subcards.push(otherCard);
    }
  }

  if (_subcards.length > 0) {
    moveQueue.value.push(draggingCard);
    listDroppedIn.value[draggingCard.id] = list;
    indexDroppedIn.value[draggingCard.id] = index;
    subcards.value[draggingCard.id] = _subcards;
  }
}

function dragEnd() {
  dragging.value = false;
  isDraggingCard.value = false;
}

let deleteMenuVisible = ref(false);
let listToDelete: List | undefined = undefined;
function listCtxAction(action: string, list: List) {
  if (action == "moveLeft") {
    if (list.position == 0) return;
    startDrag(list);
    drop(list.position - 1);
  }
  if (action == "moveRight") {
    if (list.position == props.lists.length - 1) return;
    startDrag(list);
    drop(list.position + 2);
  }
  if (action == "delete") {
    listToDelete = list;
    deleteMenuVisible.value = true;
  }
}

function deleteList() {
  deleteMenuVisible.value = false;
  if (listToDelete) {
    ws.deleteList(listToDelete.id);
  }
}

let settingsOpened = ref(false);
let infoMenuOpened = ref(false);

function deleteCard(index: number, id: string) {
  for (let card of props.cards[id]) {
    if (card.position > index) {
      ws.updateCardPosition(card.id, card.position - 1);
    }
  }
}

function checkChildren(children: Card[], other: Card) {
  for (let subCard of children) {
    if (subCard.cardId == other.id) return false;

    let subcards = [];
    for (let list of props.lists) {
      for (let card of props.cards[list.id]) {
        if (card.cardId == subCard.id) subcards.push(card);
      }
    }

    if (!checkChildren(subcards, other)) return false;
  }
  return true;
}

let assigningSubCards = ref(false);
let assigningTo: Ref<Card | undefined> = ref(undefined);
function assignCard(card: Card) {
  let subcards = [];
  for (let list of props.lists) {
    for (let subcard of props.cards[list.id]) {
      if (subcard.cardId == card.id) subcards.push(subcard);
    }
  }

  if (!checkChildren(subcards, card)) {
    return;
  }

  if (card.boardId != assigningTo.value?.boardId) return;
  ws.assignCard(card.id, assigningTo.value?.id);
}
function startAssign(card: Card) {
  assigningTo.value = card;
  assigningSubCards.value = true;
}
function hoverCard(card: Card) {
  if (!assigningSubCards.value) {
    assigningTo.value = card;
  }
}
function hoverEndCard() {
  if (!assigningSubCards.value) {
    assigningTo.value = undefined;
  }
}
function stopAssigning() {
  assigningTo.value = undefined;
  assigningSubCards.value = false;
}

function moveSubcards(card: Card) {
  let index = indexDroppedIn.value[card.id];
  for (let subcard of subcards.value[card.id]) {
    index++;
    startDragCard(subcard);
    dropCard(listDroppedIn.value[card.id], index);
  }
}
</script>

<template>
  <div @dragend="dragEnd">
    <BoardTitleBar
      :board="board"
      @settings="
        settingsOpened = !settingsOpened;
        infoMenuOpened = false;
      "
      @info="
        infoMenuOpened = !infoMenuOpened;
        settingsOpened = false;
      "
    />
    <InfoMenu v-if="infoMenuOpened" :items="infoItems" :board-id="board.id" />
    <Settings v-if="settingsOpened" :labels="labels" :board-id="board.id" />
    <button
      v-if="assigningSubCards"
      class="stopAssigning"
      @click="stopAssigning"
    >
      Stop assigning
    </button>
    <div class="lists">
      <div v-for="(list, index) in lists">
        <div class="listAndDropSpot">
          <div
            v-if="
              dragging &&
              draggingList &&
              (index - draggingList.position > 1 ||
                draggingList.position - index > 0)
            "
            class="dragDropSpot"
            @drop="() => drop(index)"
            @dragenter.prevent=""
            @dragover.prevent=""
          ></div>
          <List
            draggable="true"
            :list="list"
            :cards="cards[list.id]"
            :is-dragging-card="isDraggingCard"
            :dragging-card="draggingCard"
            :labels="labels"
            :assigned-labels="assignedLabels"
            :assigning-sub-cards="assigningSubCards"
            :assigning-to="assigningTo"
            :all-cards="cards"
            :all-lists="lists"
            @ctx-menu-action="(action: string) => listCtxAction(action, list)"
            @dragstart="() => startDrag(list)"
            @drag-start="(card: Card) => startDragCard(card)"
            @drop="(index: number) => dropCard(list, index)"
            @delete-card="(i: number, id: string) => deleteCard(i, id)"
            @assign="(card: Card) => assignCard(card)"
            @start-assign="(card: Card) => startAssign(card)"
            @hover="(card: Card) => hoverCard(card)"
            @hover-end="hoverEndCard"
          />
        </div>
      </div>
      <div
        v-if="
          dragging &&
          draggingList &&
          Math.abs(lists.length - 1 - draggingList.position) > 0
        "
        class="dragDropSpot last"
        @drop="() => drop(lists.length)"
        @dragenter.prevent=""
        @dragover.prevent=""
      ></div>
      <form
        class="flex w-80 h-fit p-2 rounded-xl mt-2 ml-4 newList"
        @submit.prevent="createNewList()"
      >
        <input
          v-model="newListName"
          placeholder="Add a list..."
          type="text"
          maxlength="20"
          class="w-full p-2"
        />
        <button class="w-1/12 scale-125 mr-2" @click="createNewList"></button>
      </form>
    </div>
    <DecisionMenu
      v-if="deleteMenuVisible"
      option-ok="Confirm"
      text="Delete list?"
      option-cancel="Cancel"
      @confirm="deleteList"
      @cancel="deleteMenuVisible = false"
    />
    <DecisionMenu
      v-if="moveQueue.length > 0"
      option-ok="Confirm"
      :text="'Move subcards of ' + moveQueue[0].title + '?'"
      option-cancel="Cancel"
      @confirm="() => moveSubcards(moveQueue.shift())"
      @cancel="moveQueue.shift()"
    />
  </div>
</template>

<style scoped>
.last {
  margin-left: 1rem;
}
.listAndDropSpot {
  display: flex;
  margin-left: 1rem;
}

.dragDropSpot {
  margin-top: 10px;
  width: 2.5rem;
  background-color: var(--color-background);
  filter: contrast(60%);
  border-color: black;
  border-style: solid;
  border-radius: 10px;
  height: 2.5rem;
}

.lists {
  overflow: auto;
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 88vh;
}

.newList {
  background-color: var(--color-list-background);
}

.newList button {
  background-color: var(--color-card-new-btn);
  margin-top: 1px;
  margin-left: 15px;
  mask: url(/plus-circle.svg) no-repeat center;
  transition: 0.3s;
}

.newList button:hover {
  background-color: var(--color-card-new-btn-hover);
}

.newList button:active {
  background-color: var(--color-card-new-btn-active);
}

.stopAssigning {
  background-color: var(--color-board-stop-assign);
  border-style: none;
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  font-size: 2rem;
  padding: 1rem 2rem;
  color: white;
  border-radius: 10px;
}

.stopAssigning:hover {
  background-color: var(--color-board-stop-assign-hover);
}

.stopAssigning:active {
  background-color: var(--color-board-stop-assign-active);
}
</style>
