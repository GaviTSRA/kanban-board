<script setup>
    let props = defineProps(["ws", "labels", "boardId"])
    
    function newLabel() {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "new": true,
            "boardId": props.boardId
        }))
    }    

    function saveName(label, name) {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "boardId": props.boardId,
            "id": label.id,
            "title": name
        }))
    }
    function saveColor(label, color) {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "boardId": props.boardId,
            "id": label.id,
            "color": color
        }))
    }
    function saveTextColor(label, color) {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "boardId": props.boardId,
            "id": label.id,
            "textColor": color
        }))
    }
</script>

<template>
    <div class="settings">
        <h1>Labels</h1>
        <div class="labels">
            <div v-for="label in props.labels" class="label">
                <EditableText :text="label.title" class="labelName" :style="{'color': label.textColor, 'background-color': label.color}" @edit="txt=>saveName(label, txt)"/>
                <EditableText :text="label.color" class="labelColor" @edit="txt=>saveColor(label, txt)"/>
                <EditableText :text="label.textColor" class="labelTextColor" @edit="txt=>saveTextColor(label, txt)"/>
            </div>
            <button @click="newLabel" class="newLabel">New Label</button>
        </div>
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
    .newLabel {
        background-color: var(--color-btn-create);
        border-style: none;
        border-radius: 10px;
        padding: .5rem 1rem;;
        height: fit-content;
        margin: 10px auto;
    }
    .newLabel:hover {
        background-color: var(--color-btn-create-hover);
    }
    .labels { 
        display: flex;
        flex-direction: column;
    }
    h1 {
        color: aqua;
        margin-left: 10px;   
    }
    .settings {
        z-index: 7;
        position: fixed;
        right: 0;
        width: 80vw;
        height: 100vh;
        background-color: var(--color-background-soft);
    }

    :deep(input) {
        width: 20vw;
    }

    @media (min-width: 1025px) {
        .settings {
            width: 20vw;
        }

        :deep(input) {
            width: 5vw;
        }
    }
</style>