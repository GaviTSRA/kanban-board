<script setup> 
    let props = defineProps(["list", "ws", "boardId"])

    function editName(txt) {
        if (txt == "") return
        props.ws.send(JSON.stringify({
            "action": "updateList",
            "id": props.list.id,
            "boardId": props.boardId,
            "title": txt
        }))
    }
</script>

<template>
    <div class="list">
        <EditableText :text="props.list.title" @edit="txt=>editName(txt)" class="title"/>
    </div>
</template>

<style scoped>
    :deep(input) {
        width: 9vw;
        height: 3vh;
        color: gray;
    }

    .list {
        margin-left: 1rem;
        margin-top: 10px;
        background-color: var(--color-background-mute);
        width: 10vw;
        max-width: 10vw;
        text-align: center;
        font-size: 1.5rem;
        border-radius: 10px;
        height: fit-content;
    }
</style>