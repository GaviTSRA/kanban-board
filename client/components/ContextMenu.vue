<script setup>
  const { actions, x, y } = defineProps(['actions', 'x', 'y'])
  const emit = defineEmits(['action-clicked'])
  
  const emitAction = (action) => {
    emit('action-clicked', action);
  }
</script>

<template>
    <div class="rcMenu" :style="{ top: y + 'px', left: x + 'px' }">
      <button v-for="action in actions" :key="action[1]" @click="emitAction(action[1])">
        {{ action[0] }}
      </button>
    </div>
</template>
  
<style scoped>
    .rcMenu {
        position: absolute;
        background-color: var(--vt-c-black-light);
        border-style: none;
        border-radius: 10px;
        filter:drop-shadow(-4px 4px 5px black);
        z-index: 9999;
    }
    .rcMenu button {
        text-align: left;
        padding-left: 20px;
        background-color: inherit;
        color: rgb(255, 74, 74);
        border-color: var(--vt-c-black-mute);
        border-width: 2px;
        width:10vw;
        height: 4vh;
        border-radius: 10px;
    }
    .rcMenu button:hover {
        background-color: var(--color-btn-danger);
        border-color: red;
        color: black;
    }
</style>