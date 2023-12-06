<script setup>
    let props = defineProps(["list", "ws", "boardId"])
    let emit = defineEmits(["ctxMenuAction"])

    function editName(txt) {
        if (txt == "") return
        props.ws.send(JSON.stringify({
            "action": "updateList",
            "id": props.list.id,
            "boardId": props.boardId,
            "title": txt
        }))
    }

    let actions = [
        ["Move left", "moveLeft", false],
        ["Move right", "moveRight", false],
        ["Delete list", "delete", true]
    ]
    let top = ref(0)
    let left = ref(0)
    let menuVisible = ref(false)
    async function openMenu(event) {
        top.value = event.y
        left.value = event.x
        
        menuVisible.value = true
    }

    function ctxMenuClicked(action) {
        menuVisible.value = false
        emit("ctxMenuAction", action)
    }
</script>

<template>
    <div class="list" @contextmenu.prevent="openMenu">
        <EditableText :text="props.list.title" @edit="txt=>editName(txt)" class="title"/>
        <ContextMenu :actions="actions" @action-clicked="ctxMenuClicked" :x="left" :y="top" v-if="menuVisible" v-click-away="() => menuVisible = false"/>
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