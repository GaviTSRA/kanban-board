<script setup lang="ts">
const props = defineProps<{
  title: string;
  content: string;
}>();
const emit = defineEmits<{
  done: [title: string, content: string];
  cancel: [];
}>();

let title = props.title;
let content = props.content;

let canCancel = false;
setTimeout(() => {
  canCancel = true;
}, 1);

function cancel() {
  if (canCancel) emit("cancel");
}
</script>

<template>
  <div class="darken"></div>
  <div v-click-away="cancel" class="menu">
    <input v-model="title" class="title" />
    <textarea v-model="content" class="content" />
    <button class="done" @click="$emit('done', title, content)">Done</button>
  </div>
</template>

<style scoped>
.title {
  width: 75%;
  margin: 1rem auto 0 auto;
  height: 2rem;
}
.content {
  width: 85%;
  margin: 1rem auto;
  min-height: 50vh;
  height: fit-content;
}
.done {
  width: 25%;
  margin: 0 auto;
  margin-top: auto;
  background-color: var(--color-btn-create);
  border-style: none;
  padding: 0.5rem 0;
  border-radius: 10px;
}
.done:hover {
  background-color: var(--color-btn-create-hover);
}
.darken {
  position: absolute;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  background-color: black;
  z-index: 8;
  opacity: 50%;
}
.menu {
  filter: drop-shadow(-10px 10px 10px black);
  display: flex;
  flex-direction: column;
  position: fixed;
  width: 30vw;
  max-height: 80vh;
  height: fit-content;
  padding-bottom: 1rem;
  background-color: var(--color-boardcreate-background);
  left: 35vw;
  top: 10vh;
  z-index: 56;
  border-radius: 10px;
}
</style>
