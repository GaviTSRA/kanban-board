<script setup>
    let props = defineProps(["items", "ws", "boardId", "itemHasOwnWs"])

    let title = ref("")
    let content = ref("")
    let editing = ref(undefined)

    function newItem() {
        editing.value = ""
        title.value = ""
        content.value = ""
    }

    function editItem(item) {
        editing.value = item
        title.value = item.title
        content.value = item.content
    }

    function save(title, content) {
        let item = editing.value
        let ws = props.ws
        if (props.itemHasOwnWs)  ws = item.ws
        if (editing.value == "") {
            ws.send(JSON.stringify({
                "action": "updateInfoItem",
                "new": true,
                "boardId": props.boardId,
                "title": title,
                "content": content
            }))
        } else {
            ws.send(JSON.stringify({
                "action": "updateInfoItem",
                "id": item.id,
                "boardId": item.boardId,
                "title": title,
                "content": content
            }))
        }
        editing.value = undefined
    }

    function deleteItem(item) {
        let ws = props.ws
        if (props.itemHasOwnWs)  ws = item.ws
        ws.send(JSON.stringify({
            "action": "updateInfoItem",
            "delete": true,
            "boardId": item.boardId,
            "id": item.id
        }))
    }
</script>

<template>
    <div class="infoMenu">
        <div v-for="item in items">
            <InfoItem :item="item" @edit="()=>editItem(item)" @delete="()=>deleteItem(item)"/>
        </div>
        <div v-if="!itemHasOwnWs" class="newItem" @click="newItem">
            <div class="icon"></div>
        </div>
    </div>
    <InfoItemEditMenu @cancel="editing = undefined" :title="title" :content="content" v-if="editing != undefined" @done="(title, content)=>save(title, content)"/>
</template>

<style scoped>
    .icon {
        background-color: var(--color-black-4);
        padding: 1rem;
        mask: url(/plus-circle.svg) no-repeat center;
    }
    .newItem {
        margin: 1rem;
        border-radius: 10px;
        border-style: dotted;
        border-color: var(--color-boardmenu-newitem-border);
        padding: 3rem;
        width: fit-content;
        background-color: var(--color-black-1);
        transition: .6s;
    }
    .newItem > div {
        transition: .5s;
    }
    .newItem:hover {
        background-color: var(--color-boardmenu-newitem-background-hover);
        border-color: var(--color-boardmenu-newitem-border-hover);
    }
    .newItem:hover div {
        background-color: var(--color-card-new-btn-hover);
    }
    .infoMenu {
        border-style:solid;
        border-width: 0;
        border-color: var(--color-black-4);
        border-top-width: 5px;
        scrollbar-width: thin;
        scrollbar-color: var(--color-list-scrollbar) var(--color-list-background);
        overflow-y: scroll;
        z-index: 7;
        position: fixed;
        right: 0;
        width: 80vw;
        height: 100vh;
        background-color: var(--color-settings-background);
        filter: drop-shadow(-10px 15px 15px black)
    }

    @media (min-width: 1025px) {
        .infoMenu {
            width: 35vw;
        }
    }
</style>