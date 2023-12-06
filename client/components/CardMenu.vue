<script setup>
    let props = defineProps(["card", "ws"])
    let emit = defineEmits(["close", "rename"])

    let canClose = false
    setTimeout(() => canClose = true, 500)

    function close() {
        if (!canClose) return
        emit('close')
    }

    function rename(txt) {
        props.ws.send(JSON.stringify({
            "action": "updateCard",
            "id": props.card.id,
            "boardId": props.card.boardId,
            "title": txt
        }))
    }
</script>

<template>
    <div class="darken"></div>
    <div v-click-away="close" class="cardMenu">
        <EditableText :text="props.card.title" @edit="txt=>rename(txt)"/>
        <p>{{ props.card.description }}</p>
    </div>
</template>

<style scoped>
    .darken {
        position: fixed;
        height: 100vh;
        width: 100vw;
        top: 0;
        left: 0;
        background-color: black;
        z-index: 2;
        opacity: 50%;
    }
    .cardMenu {
        position: absolute;
        width: 40vw;
        height: 80vh;
        top: 10vh;
        left: 30vw;
        background-color: var(--color-background-light);
        border-color: var(--color-background-soft);
        border-style: solid;
        border-width: 7px;
        opacity: 100%;
        z-index: 6;
        border-radius: 10px;
    }
</style>