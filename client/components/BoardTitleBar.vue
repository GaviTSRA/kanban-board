<script setup>
    let emit = defineEmits(["settings"])
    let props = defineProps(["board", "ws", "editable"])
    let board = props.board

    function saveNew(which, txt) {
        if (which == "title") {
            props.ws.send(JSON.stringify({
                "action": "updateBoard",
                "boardId": props.board.id,
                "title": txt
            }))
        } else {
            props.ws.send(JSON.stringify({
                "action": "updateBoard",
                "boardId": props.board.id,
                "description": txt
            }))
        }
    }
</script>

<template>
    <div class="header">
        <!-- TODO icon? -->
        <NuxtLink to="/" class="back">Back</NuxtLink>
        <EditableText :editable="props.editable" :text="board.title" @edit="txt=>saveNew('title', txt)" class="title"/>
        <EditableText :editable="props.editable" :text="board.description" :textarea="true" @edit="txt=>saveNew('description', txt)" class="description"/>
        <button @click="$emit('settings')" class="settings"></button>
    </div>
</template>

<style scoped>
    .settings {
        margin: auto;
        margin-right: 1rem;
        height: 2rem;
        width: 2rem;
        background-color: var(--color-header-settings-btn);
        mask: url(/settings.svg) no-repeat center;
        transition: .6s;
    }
    .settings:hover {
        transform: rotate(180deg);
    }
    .settings:active {
        transition: 1s;
        transform: rotate(300deg);
    }
    .back {
        margin: auto 10px;
        margin-right: 2rem;
        border-radius: 3px;
        padding: 2px 5px;
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
        font-size: 1.5rem;
        margin: auto 10px;
        color: var(--color-header-title);
        height: fit-content;
    }

    :deep(input) {
        padding: .5rem 1rem;
    }
    
    .description {
        margin: auto 0;
        margin-left: 1rem;
        width: 0;
        min-height: 1rem;
        visibility: hidden;
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