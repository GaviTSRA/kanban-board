<script setup lang="ts">
import type { Card, Label, List } from "~/types";
import { useConnection } from "@/stores";
const ws = useConnection();

const props = defineProps<{
  card: Card;
  showDropSpot: boolean;
  labels: Label[];
  assignedLabels: { [labelId: string]: string }[];
  assigningSubCards: boolean;
  assigningTo: Card;
  allLists: List[];
  allCards: { [listId: string]: Card[] };
}>();
const emit = defineEmits<{
  dragStart: [card: Card];
  drop: [];
  delete: [];
  assign: [];
  startAssign: [];
  update: [value: string];
  hover: [];
  hoverEnd: [];
}>();

function getDescription() {
  let description = props.card.description;
  if (description.length > 110) {
    let newDescription = "";
    let parts = description.split(" ");
    for (const part of parts) {
      if (newDescription.length + part.length < 110)
        newDescription += " " + part;
    }
    if (newDescription == "") newDescription = description.substring(0, 110);
    description = newDescription + "...";
  }
  return description;
}

let cardMenuVisible = ref(false);
let dropSpotVisible = ref(false);
let deleteMenuVisible = ref(false);

let labelMenu = [];

onBeforeUpdate(() => {
  labelMenu = [];
  for (let label of props.labels) {
    labelMenu.push({
      name: (isEnabled(label) ? "Remove '" : "Add '") + label.title + "'",
      danger: isEnabled(label),
      action: "changeLabel:" + label.id,
    });
  }
  actions = [
    {
      name: "Labels",
      submenu: labelMenu,
    },
    {
      name: "Assign sub cards",
      action: "assignSubCards",
    },
    {
      name: "Unasign",
      action: "unasign",
    },
    {
      name: "Delete card",
      action: "delete",
      danger: true,
    },
  ];
});

type ActionEntry = {
  name: string;
  action?: string;
  danger?: boolean;
  submenu?: ActionEntry[];
};
let actions: ActionEntry[] = [];

let top = ref(0);
let left = ref(0);
let menuVisible = ref(false);
async function openMenu(event: MouseEvent) {
  top.value = event.y;
  left.value = event.x;

  menuVisible.value = true;
}

function isEnabled(label: Label) {
  let filtered = props.assignedLabels.filter((el) => {
    return el.labelId == label.id && el.cardId == props.card.id;
  });
  return filtered.length > 0;
}

function ctxMenuClicked(action: string) {
  menuVisible.value = false;
  if (action.startsWith("changeLabel")) {
    let label = action.split(":")[1];
    if (
      props.labels.filter((el) => {
        return el.id == label;
      })[0].boardId != props.card.boardId
    )
      return;
    ws.toggleLabel(label, props.card.id);
  }

  if (action == "delete") {
    deleteMenuVisible.value = true;
  }

  if (action == "assignSubCards") {
    emit("startAssign");
  }

  if (action == "unasign") {
    ws.assignCard(props.card.id, null);
  }
}

function deleteCard() {
  ws.deleteCard(props.card.id);
  deleteMenuVisible.value = false;
  emit("delete");
}

function cardClick() {
  if (props.assigningSubCards) {
    emit("assign");
    return;
  }
  cardMenuVisible.value = true;
}

let notHiddenByMasterCard = useLocalStorage(
  "showSubCards-" + props.card.cardId,
  true,
);
let notHiddenByBoard = useLocalStorage("showSubCards", true);
let forceShowAll = useLocalStorage("showAllCards", false);
watch(
  () => props.card.cardId,
  () =>
    (notHiddenByMasterCard = useLocalStorage(
      "showSubCards-" + props.card.cardId,
      true,
    )),
);

function shadeColor(color: string) {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);

  // R = parseInt(R * (100 + percent) / 100);
  // G = parseInt(G * (100 + percent) / 100);
  // B = parseInt(B * (100 + percent) / 100);

  const COLOR_MAX = 150;
  R = R < COLOR_MAX ? R : COLOR_MAX;
  G = G < COLOR_MAX ? G : COLOR_MAX;
  B = B < COLOR_MAX ? B : COLOR_MAX;

  const COLOR_MIN = 50;
  R = R > COLOR_MIN ? R : COLOR_MIN;
  G = G > COLOR_MIN ? G : COLOR_MIN;
  B = B > COLOR_MIN ? B : COLOR_MIN;

  if (Math.abs(G - R) < 60) G += 60;
  if (Math.abs(G - B) < 60) G -= 60;
  if (Math.abs(B - G) < 60) B += 60;
  if (Math.abs(B - R) < 60) B -= 60;
  if (Math.abs(R - B) < 60) R += 60;
  if (Math.abs(R - G) < 60) R -= 60;

  R = R < COLOR_MAX ? R : COLOR_MAX;
  G = G < COLOR_MAX ? G : COLOR_MAX;
  B = B < COLOR_MAX ? B : COLOR_MAX;

  R = R > COLOR_MIN ? R : COLOR_MIN;
  G = G > COLOR_MIN ? G : COLOR_MIN;
  B = B > COLOR_MIN ? B : COLOR_MIN;

  R = Math.round(R);
  G = Math.round(G);
  B = Math.round(B);

  var RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
}

function getParent(id: string) {
  for (let list of props.allLists) {
    for (let card of props.allCards[list.id]) {
      if (card.id == id) {
        if (card.cardId) return getParent(card.cardId);
        return card;
      }
    }
  }
}

function getColor(string: string) {
  if (colorAllSame.value) {
    let child;
    for (let list of props.allLists) {
      for (let card of props.allCards[list.id]) {
        if (card.id == string) child = card;
      }
    }
    if (!child) return "#FFFFFF";
    if (child.cardId == null) return shadeColor("#" + string.slice(0, 6));
    let parent = getParent(child.cardId);
    if (!parent) return "#FFFFFF";
    return shadeColor("#" + parent.id.slice(0, 6));
  }

  return shadeColor("#" + string.slice(0, 6));
}

let colorAllSame = useLocalStorage("colorAllSame", false);
</script>

<template>
  <div
    v-if="
      (notHiddenByMasterCard &&
        (notHiddenByBoard || props.card.cardId == undefined)) ||
      forceShowAll
    "
    draggable="true"
    @contextmenu.prevent="openMenu"
    @dragstart.stop="$emit('dragStart', props.card)"
  >
    <div
      :class="{
        cardDropSpot: dropSpotVisible && props.showDropSpot,
        cardDropSpotSmall: true,
      }"
      @dragenter.prevent="dropSpotVisible = true"
      @dragover.prevent="dropSpotVisible = true"
      @dragleave="dropSpotVisible = false"
      @drop="
        (e) => {
          $emit('drop');
          dropSpotVisible = false;
        }
      "
    ></div>
    <div
      class="py-2 px-4 rounded-xl container"
      :class="{
        // assigningTo: props.assigningTo ? props.assigningTo.cardId == props.card.id : false,
        // isAssigned: props.assigningTo != undefined ? props.assigningTo.id == props.card.cardId : false,
        assigned: props.card.cardId != undefined,
        hasAssigned: props.card.subcards != 0,
      }"
      :style="{
        'border-color':
          props.card.cardId != undefined
            ? getColor(props.card.cardId)
            : '#000000',
        '--id-color': getColor(props.card.id),
      }"
      @click="cardClick"
      @mouseenter="$emit('hover')"
      @mouseleave="$emit('hoverEnd')"
    >
      <div class="firstLine flex items-center">
        <p class="text-lg">{{ props.card.title }}</p>
        <p
          v-if="props.card.subcardCount && props.card.subcardCount > 0"
          class="ml-auto"
          :class="{
            subcardCount: true,
            progress: true,
            complete: card.subcardCount == card.subcardsDone,
          }"
        >
          {{ card.subcardsDone }}/{{ card.subcardCount }}
        </p>
      </div>
      <p
        v-if="props.card.description != undefined"
        class="text-sm leading-tight mt-1 description"
      >
        {{ getDescription() }}
      </p>
      <div class="flex flex-wrap gap-1 mt-1">
        <div v-for="label in labels">
          <p
            v-if="isEnabled(label)"
            class="rounded-lg px-2"
            :style="{ color: label.textColor, 'background-color': label.color }"
          >
            {{ label.title }}
          </p>
        </div>
      </div>
      <div v-if="props.card.checklists.length != 0" class="checklists">
        <div v-for="checklist in props.card.checklists" class="checklist">
          <span
            :class="{
              progress: true,
              complete:
                checklist.checklistItems &&
                checklist.checklistItems.filter((item) => item.checked)
                  .length == checklist.checklistItems.length,
            }"
            >{{
              checklist.checklistItems?.filter((item) => item.checked).length
            }}/{{ checklist.checklistItems?.length }}</span
          >
          {{ checklist.title }}
        </div>
      </div>
    </div>
    <CardMenu
      v-if="cardMenuVisible"
      :labels="props.labels"
      :assigned-labels="props.assignedLabels"
      :card="card"
      @close="cardMenuVisible = false"
    />
    <ContextMenu
      v-if="menuVisible"
      v-all-click-away="() => (menuVisible = false)"
      :actions="actions"
      :x="left"
      :y="top"
      @action-clicked="ctxMenuClicked"
    />
    <DecisionMenu
      v-if="deleteMenuVisible"
      option-ok="Confirm"
      text="Delete card?"
      option-cancel="Cancel"
      @confirm="deleteCard"
      @cancel="deleteMenuVisible = false"
    />
  </div>
</template>

<style scoped>
.assigned {
  border-width: 0;
  border-top-width: 5px;
  border-style: solid;
}
.progress {
  display: inline-block;
  padding: 0 0.25rem;
  margin-top: 5px;
  text-align: center;
  width: 3rem;
  background-color: var(--color-card-small-checklist-background);
  border-radius: 10px;
}
.complete {
  background-color: var(--color-card-small-checklist-complete);
}

.cardDropSpotSmall {
  width: 100%;
  height: 15px;
}
.cardDropSpot {
  height: 4rem;
}
.container {
  background-color: var(--color-card-primary);
}
.assigningTo {
  background-color: var(--color-card-assinging-to);
}
.isAssigned {
  background-color: var(--color-card-is-subcard);
}
.hasAssigned {
  background-color: var(--id-color);
}
</style>
