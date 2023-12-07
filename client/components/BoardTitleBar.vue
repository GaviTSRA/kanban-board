<script setup>
    let props = defineProps(["board", "ws"])
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
        <EditableText :text="board.title" @edit="txt=>saveNew('title', txt)" class="title"/>
        <!-- TODO text area -->
        <EditableText :text="board.description" :textarea="true" @edit="txt=>saveNew('description', txt)" class="description"/>
    </div>
</template>

<style scoped>
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
        background-color: var(--color-background-mute);
        overflow: hidden;
    }

    .title {
        font-size: 1.5rem;
        margin: 10px;
        color: aqua;
        height: 1.5rem;
    }

    :deep(input) {
        padding: .5rem 1rem;
    }
    
    .description {
        margin: auto 0;
        margin-left: 1rem;
        width: 30vw;
        min-height: 1rem;
    }

    .description :deep(textarea) {
        width: 25vw;
        height: 100%;
        resize: none;
        color: var(--color-text);
        font-size: 1rem;
    }
</style>