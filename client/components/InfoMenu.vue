<script setup lang="ts">
import { useConnection } from "@/stores";
import type { InfoItem } from "~/types";
const ws = useConnection();

const props = defineProps<{
  items: InfoItem[];
  boardId: string;
}>();

let title = ref("");
let content = ref("");
let editing: Ref<InfoItem | undefined> = ref(undefined);
let creatingItem = ref(false);

function newItem() {
  creatingItem.value = true;
  editing.value = undefined;
  title.value = "";
  content.value = "";
}

function editItem(item: InfoItem) {
  editing.value = item;
  title.value = item.title;
  content.value = item.content;
}

function save(title: string, content: string) {
  let item = editing.value;
  creatingItem.value = false;
  if (editing.value === undefined) {
    ws.createInfoItem(props.boardId, title, content);
  } else if (item) {
    ws.updateInfoItem(item.id, title, content);
  }
  editing.value = undefined;
}
</script>

<template>
  <div class="infoMenu">
    <div v-for="item in props.items">
      <InfoItem
        :item="item"
        @edit="() => editItem(item)"
        @delete="() => ws.deleteInfoItem(item.id)"
      />
    </div>
    <div class="newItem" @click="newItem">
      <div class="icon"></div>
    </div>
  </div>
  <InfoItemEditMenu
    v-if="editing != undefined || creatingItem"
    :title="title"
    :content="content"
    @cancel="editing = undefined"
    @done="(title: string, content: string) => save(title, content)"
  />
</template>

<style scoped>
.icon {
  background-color: var(--color-black-4);
  padding: 1rem;
  mask: url(/plus-circle.svg) no-repeat center;
}
.newItem {
  margin: 1rem;
  border-radius: 10px;
  border-style: dotted;
  border-color: var(--color-boardmenu-newitem-border);
  padding: 3rem;
  width: fit-content;
  background-color: var(--color-black-1);
  transition: 0.6s;
}
.newItem > div {
  transition: 0.5s;
}
.newItem:hover {
  background-color: var(--color-boardmenu-newitem-background-hover);
  border-color: var(--color-boardmenu-newitem-border-hover);
}
.newItem:hover div {
  background-color: var(--color-card-new-btn-hover);
}
.infoMenu {
  border-style: solid;
  border-width: 0;
  border-color: var(--color-black-4);
  border-top-width: 5px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-list-scrollbar) var(--color-list-background);
  overflow-y: scroll;
  z-index: 7;
  position: fixed;
  right: 0;
  width: 80vw;
  height: 100vh;
  background-color: var(--color-settings-background);
  filter: drop-shadow(-10px 15px 15px black);
}

@media (min-width: 1025px) {
  .infoMenu {
    width: 35vw;
  }
}
</style>
