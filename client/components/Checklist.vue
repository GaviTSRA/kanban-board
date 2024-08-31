<script setup lang="ts">
import { useConnection } from "@/stores";
import type { Checklist } from "~/types";
const ws = useConnection();

const props = defineProps<{
  checklist: Checklist;
}>();

function newItem() {
  ws.createChecklistItem(
    props.checklist.id,
    "New checklist item",
    props.checklist.checklistItems.length,
  );
}
</script>

<template>
  <div class="checklist">
    <div class="titleContainer">
      <button
        class="delete"
        @click="ws.deleteChecklist(props.checklist.id)"
      ></button>
      <EditableText
        :maxlength="20"
        :focus="props.checklist.title == ''"
        class="title"
        :text="props.checklist.title"
        @edit="(txt: any) => ws.updateChecklistTitle(props.checklist.id, txt)"
      />
    </div>
    <div v-for="item in props.checklist.checklistItems">
      <ChecklistItem :item="item" />
    </div>
    <button
      v-if="props.checklist.title"
      class="newItemBtn"
      @click="newItem"
    ></button>
  </div>
</template>

<style scoped>
.titleContainer {
  display: flex;
  flex-direction: row;
}
.title {
  text-align: left;
  color: var(--color-cardmenu-checklist-title);
}
.delete {
  background-color: var(--color-cardmenu-checklist-delete);
  border-style: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 1rem;
  mask: url(/trash-2.svg) no-repeat center;
}
.delete:hover {
  background-color: var(--color-cardmenu-checklist-delete-hover);
}
.newItemBtn {
  transform: scale(1.25);
  align-self: center;
  margin-right: 95%;
  background-color: var(--color-cardmenu-checklist-new-item);
  border-style: none;
  padding: 1rem 1rem;
  border-radius: 10px;
  font-size: 1rem;
  mask: url(/plus-square.svg) no-repeat center;
}
.newItemBtn:hover {
  background-color: var(--color-cardmenu-checklist-new-item-hover);
}
.checklist {
  padding: 0 0 1rem 0;
  border-radius: 10px;
  margin-top: 1.5rem;
  width: 100%;
}
</style>
