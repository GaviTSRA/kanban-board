<script setup lang="ts">
import type { Card, Label, List } from "~/types";
import { useConnection } from "@/stores";
const ws = useConnection();

const props = defineProps<{
  list: List;
  cards: Card[];
  draggingCard: Card;
  isDraggingCard: boolean;
  assignedLabels: { [id: string]: string };
  labels: Label[];
  assigningSubCards: boolean;
  assigningTo: Card;
  allLists: List[];
  allCards: [];
}>();
const emit = defineEmits<{
  ctxMenuAction: [action: string];
  dragStart: [card: Card];
  drop: [index: number];
  deleteCard: [index: number, listId: string];
  assign: [card: Card];
  startAssign: [card: Card];
  hover: [card: Card];
  hoverEnd: [];
}>();

function editName(txt: string) {
  if (txt == "") return;
  ws.updateListTitle(props.list.id, txt);
}

let actions = [
  {
    name: "Move left",
    action: "moveLeft",
  },
  {
    name: "Move right",
    action: "moveRight",
  },
  {
    name: "Delete list",
    action: "delete",
    danger: true,
  },
];
let top = ref(0);
let left = ref(0);
let menuVisible = ref(false);
function openMenu(event: MouseEvent) {
  top.value = event.y;
  left.value = event.x;

  menuVisible.value = true;
}

function ctxMenuClicked(action: string) {
  menuVisible.value = false;
  emit("ctxMenuAction", action);
}

let newCardName = ref("");
function createCard() {
  if (newCardName.value == "") return;
  ws.createCard(props.list.id, newCardName.value, props.cards.length);
  newCardName.value = "";
}
</script>

<template>
  <div class="mt-2 p-3 rounded-xl w-80 list" @contextmenu.prevent="openMenu">
    <EditableText
      :maxlength="20"
      :text="props.list.title"
      class="h-8 text-2xl ml-1"
      @edit="(txt: string) => editName(txt)"
    />
    <ContextMenu
      v-if="menuVisible"
      v-all-click-away="() => (menuVisible = false)"
      :actions="actions"
      :x="left"
      :y="top"
      @action-clicked="ctxMenuClicked"
    />
    <div class="cards">
      <div v-for="(card, index) in props.cards" :key="card.id">
        <Card
          :card="card"
          :labels="props.labels"
          :assigned-labels="props.assignedLabels"
          :show-drop-spot="
            props.isDraggingCard &&
            (props.draggingCard.listId != props.list.id ||
              index - draggingCard?.position > 1 ||
              draggingCard?.position - index > 0)
          "
          :assigning-sub-cards="props.assigningSubCards"
          :assigning-to="props.assigningTo"
          :all-cards="props.allCards"
          :all-lists="props.allLists"
          @drag-start="(card) => $emit('dragStart', card)"
          @drop="$emit('drop', index)"
          @delete="$emit('deleteCard', index, list.id)"
          @assign="$emit('assign', card)"
          @start-assign="$emit('startAssign', card)"
          @hover="$emit('hover', card)"
          @hover-end="$emit('hoverEnd')"
        />
      </div>
      <div
        v-if="
          props.isDraggingCard && props.draggingCard.listId === props.list.id
        "
        class="cardDropSpot"
        @dragenter.prevent=""
        @dragover.prevent=""
        @drop="$emit('drop', props.cards.length)"
      ></div>
    </div>
    <div class="mt-4 newCard">
      <form class="flex" @submit.prevent="createCard">
        <input
          v-model="newCardName"
          class="mr-2.5 w-full p-1"
          type="text"
          maxlength="255"
          placeholder="Add a card..."
        />
        <button class="w-1/12" @click="createCard"></button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.cardDropSpot {
  height: 2rem;
  width: 100%;
}

.newCard button {
  background-color: var(--color-card-new-btn);
  mask: url(/plus-circle.svg) no-repeat center;
  transition: 0.3s;
}

.newCard button:hover {
  background-color: var(--color-card-new-btn-hover);
}

.newCard button:active {
  background-color: var(--color-card-new-btn-active);
}

.list {
  background-color: var(--color-list-background);
}

.cards {
  max-height: 75vh;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-list-scrollbar) var(--color-list-background);
}

::-webkit-scrollbar {
  background: var(--color-list-background);
}

::-webkit-scrollbar-thumb {
  background: var(--color-list-scrollbar);
}
</style>
