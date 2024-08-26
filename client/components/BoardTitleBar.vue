<script setup lang="ts">
import { useConnection } from "@/stores";
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
      @edit="ws.updateBoardTitle"
      class="title"
    />
    <!-- TODO proper max length -->
    <EditableText
      :maxlength="125"
      :text="props.board.description"
      :textarea="true"
      @edit="ws.updateBoardDescription"
      class="description"
    />
    <button @click="$emit('info')" class="info"></button>
    <button @click="$emit('settings')" class="settings"></button>
  </div>
</template>

<style scoped>
.settings {
  margin: auto 0;
  margin-right: 1rem;
  height: 2rem;
  width: 2rem;
  background-color: var(--color-header-settings-btn);
  mask: url(/settings.svg) no-repeat center;
  transition: 0.6s;
}
.info {
  margin: auto;
  margin-right: 1rem;
  height: 2rem;
  width: 2rem;
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
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 1.5rem;
  margin: auto 10px;
  color: var(--color-header-title);
  height: fit-content;
}

:deep(input) {
  padding: 0.5rem 1rem;
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

.description :deep(textarea) {
  width: 25vw;
  height: 100%;
  resize: none;
  color: var(--color-header-desc);
  font-size: 1rem;
}

@media (min-width: 600px) {
  .description {
    visibility: visible;
    width: 30vw;
  }
}
</style>
