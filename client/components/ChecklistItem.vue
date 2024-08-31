<script setup lang="ts">
import type { ChecklistItem } from "~/types";
import { useConnection } from "@/stores";
const ws = useConnection();

const props = defineProps<{
  item: ChecklistItem;
}>();

async function rename(txt: string) {
  if (txt == "") {
    ws.deleteChecklistItem(props.item.id);
    return;
  }
  ws.updateChecklistItemTitle(props.item.id, txt);
}
</script>

<template>
  <div class="item">
    <input
      class="checkbox"
      type="checkbox"
      :checked="props.item.checked"
      @input="
        (value) =>
          ws.updateChecklistItemChecked(props.item.id, value.target.checked)
      "
    />
    <EditableText
      :maxlength="20"
      :focus="props.item.title == ''"
      :class="{ checked: props.item.checked }"
      :text="props.item.title"
      @edit="(txt: string) => rename(txt)"
    />
    <button
      class="deleteBtn"
      @click="() => ws.deleteChecklistItem(props.item.id)"
    >
      <img src="/trash-2.svg" />
    </button>
  </div>
</template>

<style scoped>
.deleteBtn {
  margin-left: 1rem;
  margin-right: 10px;
  background-color: var(--color-cardmenu-checklist-delete-item);
  border-radius: 10px;
  border-style: none;
  margin-left: auto;
}
.checked {
  text-decoration: line-through;
  text-decoration-color: black;
  text-decoration-thickness: 3px;
}
.checkbox {
  width: fit-content;
  min-width: 1rem;
  margin-right: 10px;
}
.item {
  width: 70%;
  margin: 0;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  border-radius: 10px;
  font-size: 1rem;
  text-align: left;
}

input[type="checkbox"] {
  transform: scale(1.5);
}
</style>
