<script setup>
    let props = defineProps(["label", "ws", "boardId"])

    function saveName(name) {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "boardId": props.boardId,
            "id": props.label.id,
            "title": name
        }))
    }
    function saveColor(color) {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "boardId": props.boardId,
            "id": props.label.id,
            "color": color
        }))
    }
    function saveTextColor(color) {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "boardId": props.boardId,
            "id": props.label.id,
            "textColor": color
        }))
    }

    let actions = [
        ["Delete label", "delete", true]
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
        if (action == "delete") {
            props.ws.send(JSON.stringify({
                "action": "updateLabel",
                "delete": true,
                "boardId": props.boardId,
                "id": props.label.id
            }))
        }
    }
</script>

<template>
    <div class="label" @contextmenu.prevent="openMenu">
        <ContextMenu :actions="actions" @action-clicked="ctxMenuClicked" :x="left" :y="top" v-if="menuVisible" v-click-away="() => menuVisible = false"/>
        <EditableText :text="props.label.title" class="labelName" :style="{'color': props.label.textColor, 'background-color': props.label.color}" @edit="txt=>saveName(txt)"/>
        <EditableText :text="props.label.color" class="labelColor" @edit="txt=>saveColor(txt)"/>
        <EditableText :text="props.label.textColor" class="labelTextColor" @edit="txt=>saveTextColor(txt)"/>
    </div>
</template>

<style scoped>
    .labelTextColor {
        margin: 10px;
    }
    .labelName {
        padding: 0 .5rem;
        text-align: center;
        height: fit-content;
        width: 10rem;
        margin: 10px;
        border-radius: 10px;
    }
    .labelColor {
        height: 2rem;
        margin: 10px;
    }
    .label {
        height: 2rem;
        display: flex;
        flex-direction: row;
        margin-top: 10px;
    }
</style>