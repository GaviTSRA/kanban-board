<script setup lang="ts">
import { useConnection } from "@/stores";
import type { Board } from "~/types";
const ws = useConnection();

const props = defineProps<{
  board: Board;
}>();
const emit = defineEmits<{
  settings: [];
  info: [];
}>();
</script>

<template>
  <div class="header">
    <NuxtLink to="/" class="back"></NuxtLink>
    <!-- TODO proper max length -->
    <EditableText
      :maxlength="20"
      :text="props.board.title"
      class="w-fit h-fit my-auto px-4 py-2 rounded text-xl title"
      @edit="ws.updateBoardTitle"
    />
    <!-- TODO proper max length -->
    <EditableText
      :maxlength="125"
      :text="props.board.description"
      :textarea="true"
      class="description"
      @edit="ws.updateBoardDescription"
    />
    <button class="my-auto ml-auto h-8 w-8 info" @click="emit('info')"></button>
    <button
      class="h-8 w-8 my-auto mx-4 settings"
      @click="emit('settings')"
    ></button>
  </div>
</template>

<style scoped>
.settings {
  background-color: var(--color-header-settings-btn);
  mask: url(/settings.svg) no-repeat center;
  transition: 0.6s;
}
.info {
  background-color: var(--color-header-settings-btn);
  mask: url(/info.svg) no-repeat center;
  transition: 0.6s;
}
.settings:hover {
  transform: rotate(180deg);
}
.settings:active {
  transition: 1s;
  transform: rotate(300deg);
}
.back {
  transform: scale(1.5);
  margin: auto 10px;
  margin-right: 1rem;
  border-radius: 3px;
  padding: 2px 5px;
  background-color: var(--color-header-btn-back);
  padding: 1rem;
  mask: url(/arrow-left-circle.svg) no-repeat center;
  transition: 0.2s;
}
.back:hover {
  background-color: var(--color-header-btn-back-hover);
}
.header {
  display: flex;
  flex-direction: row;
  top: 0;
  left: 0;
  width: 100vw;
  height: 7vh;
  min-height: 3rem;
  background-color: var(--color-header-background);
  overflow: hidden;
}

.title {
  background-color: var(--color-header-title-background);
  color: var(--color-header-title);
}

.description {
  overflow-wrap: break-word;
  margin: auto 0;
  margin-left: 1rem;
  width: 0;
  min-height: 1rem;
  visibility: hidden;
  color: var(--color-header-desc);
}

@media (min-width: 600px) {
  .description {
    visibility: visible;
    width: 30vw;
  }
}
</style>
