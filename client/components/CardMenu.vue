<script setup lang="ts">
import type { Card, Label } from "~/types";

const props = defineProps<{
  card: Card;
  ws: WebSocket;
  labels: Label[];
  assignedLabels: { [labelId: string]: string }[];
}>();
const emit = defineEmits<{
  close: [];
}>();

let canClose = false;
setTimeout(() => (canClose = true), 100);

function close() {
  if (!canClose) return;
  emit("close");
}

function rename(txt: string) {
  props.ws.send(
    JSON.stringify({
      action: "updateCard",
      id: props.card.id,
      boardId: props.card.boardId,
      title: txt,
    }),
  );
}

function editDesc(txt: string) {
  props.ws.send(
    JSON.stringify({
      action: "updateCard",
      id: props.card.id,
      boardId: props.card.boardId,
      description: txt,
    }),
  );
}

function toggle(label: Label) {
  props.ws.send(
    JSON.stringify({
      action: "toggleLabel",
      boardId: props.card.boardId,
      cardId: props.card.id,
      labelId: label.id,
    }),
  );
}

function isEnabled(label: Label) {
  let filtered = props.assignedLabels.filter((el) => {
    return el.labelId == label.id && el.cardId == props.card.id;
  });
  return filtered.length > 0;
}

function newChecklist() {
  if (
    !props.card.checklists ||
    props.card.checklists.length == 0 ||
    props.card.checklists[props.card.checklists.length - 1].title != ""
  ) {
    props.card.checklists.push({ new: true });
    send();
  }
}

function send() {
  props.ws.send(
    JSON.stringify({
      action: "updateCard",
      id: props.card.id,
      boardId: props.card.boardId,
      checklists: props.card.checklists,
    }),
  );
}

let showSubCards = useLocalStorage("showSubCards-" + props.card.id, true);
</script>

<template>
  <div draggable="true" @contextmenu.stop="" @dragstart.prevent.stop="">
    <div class="darken" @click="close"></div>
    <div class="cardMenu">
      <EditableText
        :center="true"
        :maxlength="20"
        :text="props.card.title"
        class="title"
        @edit="(txt: string) => rename(txt)"
      />
      <EditableText
        :maxlength="125"
        :textarea="true"
        :text="props.card.description"
        class="description"
        @edit="(txt: string) => editDesc(txt)"
      />
      <div class="labels">
        <div v-for="label in props.labels" @click="() => toggle(label)">
          <p
            :class="{ label: true, disabled: !isEnabled(label) }"
            :style="{ color: label.textColor, 'background-color': label.color }"
          >
            {{ label.title }}
          </p>
        </div>
      </div>
      <div class="showSubCardsOption">
        <input
          id="showSubCardsCheckbox"
          v-model="showSubCards"
          type="checkbox"
        />
        <label class="showSubCardsText" for="showSubCardsCheckbox"
          >Show Subcards</label
        >
      </div>
      <div class="checklistSection">
        <div v-for="checklist in props.card.checklists" class="checklists">
          <Checklist :checklist="checklist" @send="send" />
        </div>
        <button
          v-if="
            !props.card.checklists ||
            props.card.checklists.length == 0 ||
            props.card.checklists[props.card.checklists.length - 1].title != ''
          "
          class="newChecklistBtn"
          @click="newChecklist"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.showSubCardsText {
  margin-left: 10px;
}
#showSubCardsCheckbox {
  transform: scale(2);
  margin-left: 20px;
}
.showSubCardsOption {
  display: flex;
  flex-direction: row;
  text-align: left;
}
.checklistSection {
  margin-top: 2rem;
}
.newChecklistBtn {
  background-color: var(--color-cardmenu-checklist-new);
  border-style: none;
  transform: scale(3);
  border-radius: 10px;
  padding: 1rem;
  margin-left: 1.5rem;
  font-size: 1rem;
  margin-right: 100%;
  mask: url(/plus-square.svg) no-repeat center;
}
.newChecklistBtn:hover {
  background-color: var(--color-cardmenu-checklist-new-hover);
}
.checklists {
  width: 90%;
  margin: 10px 10px;
  display: flex;
  align-items: left;
}
.disabled {
  opacity: 30%;
}
.label {
  border-radius: 10px;
  padding: 0.25rem 0.5rem;
  margin-left: 10px;
  margin-top: 10px;
  font-size: 1rem;
}
.labels {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

:deep(.editable textarea, .editable input) {
  padding: 0.5rem 1rem;
}

.darken {
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  background-color: black;
  z-index: 29;
  opacity: 50%;
}
.cardMenu {
  overflow-y: scroll;
  overflow-x: hidden;
  position: absolute;
  width: 80vw;
  height: 90vh;
  top: 5vh;
  left: 10vw;
  background-color: var(--color-cardmenu-background);
  border-color: var(--color-cardmenu-border);
  border-style: solid;
  border-width: 7px;
  opacity: 100%;
  z-index: 6999;
  border-radius: 10px;
  filter: drop-shadow(-5px 5px 5px black);
  scrollbar-width: thin;
  scrollbar-color: var(--color-cardmenu-scrollbar)
    var(--color-cardmenu-background);
}

::-webkit-scrollbar {
  height: 12px;
  width: 12px;
  background: var(--color-cardmenu-background);
}

::-webkit-scrollbar-thumb {
  background: var(--color-cardmenu-scrollbar);
  -webkit-border-radius: 10px;
}

.title {
  background-color: var(--color-cardmenu-title-background);
  border-radius: 10px;
  color: var(--color-cardmenu-title);
  width: 100%;
}

.description {
  width: 90%;
  overflow: wrap;
  overflow-wrap: break-word;
  background-color: var(--color-cardmenu-desc-background);
  margin: 10px 5%;
  height: 10%;
  border-radius: 10px;
  text-align: left;
}

:deep(p) {
  width: 100%;
}

.description :deep(textarea),
.description :deep(p) {
  height: 100%;
  width: 100%;
  color: var(--color-cardmenu-desc);
  font-size: 1rem;
}
.description :deep(p) {
  padding: 10px;
  font-size: 0.75rem;
}

@media (min-width: 1025px) {
  .cardMenu {
    width: 40vw;
    left: 30vw;
  }
  .description :deep(p) {
    font-size: 1rem;
  }
  .label {
    padding: 0.5rem 1rem;
  }
  .checklists {
    width: 70%;
    margin: 10px 10px;
  }
}
</style>
