<script setup>
    const { actions, x, y } = defineProps(['actions', 'x', 'y'])
    const emit = defineEmits(['action-clicked'])
    
    const emitAction = (action) => {
        emit('action-clicked', action);
    }
</script>

<template>
    <div @contextmenu.prevent.stop="" class="rcMenu" :style="{ top: y + 'px', left: x + 'px' }">
        <button v-for="action in actions" :class="{danger: action[2], nodanger: !action[2]}" :key="action[1]" @click="emitAction(action[1])">
            {{ action[0] }}
        </button>
    </div>
</template>
  
<style scoped>
    .rcMenu {
        position: fixed;
        display: flex;
        flex-direction: column;
        background-color: var(--color-background-mute);
        border-style: none;
        border-radius: 10px;
        filter:drop-shadow(-4px 4px 5px black);
        z-index: 9999;
    }
    
    .rcMenu button {
        z-index: 9999;
        text-align: left;
        padding-left: 20px;
        background-color: var(--color-background-mute);
        border-style: none;
        border-width: 2px;
        width:40vw;
        height: 4vh;
        border-radius: 10px;
    }
    .rcMenu .nodanger:hover {
        background-color: var(--color-background-light);
        border-color: var(--color-background-mute);
    }
    
    .nodanger {
        color:white;
    }

    .danger {
        color: rgb(255, 74, 74);
    }

    .danger:hover {
        background-color: var(--color-btn-danger);
        border-color: red;
        color: black;
    }

    @media (min-width: 1025px) {
        .rcMenu button {
            width:10vw;
        }
    }
</style>