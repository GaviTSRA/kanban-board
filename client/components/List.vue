<script setup>
    let props = defineProps(["list", "ws", "cards"])
    let emit = defineEmits(["ctxMenuAction"])

    function editName(txt) {
        if (txt == "") return
        props.ws.send(JSON.stringify({
            "action": "updateList",
            "id": props.list.id,
            "boardId": list.boardId,
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

    let newCardName = ref("")
    function createCard() {
        props.ws.send(JSON.stringify({
            "action": "updateCard",
            "new": true,
            "title": newCardName.value,
            "boardId": props.list.boardId,
            "listId": props.list.id,
            "position": props.cards.length
        }))
        newCardName.value = ""
    }
</script>

<template>
    <div class="list" @contextmenu.prevent="openMenu">
        <EditableText :text="props.list.title" @edit="txt=>editName(txt)" class="title"/>
        <ContextMenu :actions="actions" @action-clicked="ctxMenuClicked" :x="left" :y="top" v-if="menuVisible" v-click-away="() => menuVisible = false"/>
        <div class="cards">
            <div v-for="card in cards">
                <Card :ws="props.ws" :card="card"/>
            </div>
        </div>
        <div class="newCard">
            <input type="text" v-model="newCardName"/>
            <button @click="createCard">Add card</button>
        </div>
    </div>
</template>

<style scoped>
    .newCard input {
        width: 65%;
        margin-right: 10px;
    }

    .newCard button {
        width: 20%;
        background-color: var(--color-btn-create);
        border-style: none;
        padding: .5rem .25rem;
        border-radius: 10px;
        margin-bottom: 10px;
    }

    .newCard button:hover {
        background-color: var(--color-btn-create-hover);
    }

    :deep(input) {
        width: 9vw;
        height: 3vh;
        color: gray;
    }

    .list {
        margin-left: 1rem;
        margin-top: 10px;
        background-color: var(--color-background-mute);
        width: 20rem;
        text-align: center;
        font-size: 1.5rem;
        border-radius: 10px;
        height: fit-content;
    }
</style>