<script setup>
    let props = defineProps(["card", "ws", "labels", "assignedLabels"])
    let emit = defineEmits(["close", "rename"])

    let canClose = false
    setTimeout(() => canClose = true, 100)

    console.log(props.card.checklists)

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

    function editDesc(txt) {
        props.ws.send(JSON.stringify({
            "action": "updateCard",
            "id": props.card.id,
            "boardId": props.card.boardId,
            "description": txt
        }))
    }

    function toggle(label) {
        props.ws.send(JSON.stringify({
            "action": "toggleLabel",
            "boardId": props.card.boardId,
            "cardId": props.card.id,
            "labelId": label.id
        }))
    }

    function isEnabled(label) {
        let filtered = props.assignedLabels.filter(el => {
            return el.labelId == label.id && el.cardId == props.card.id
        })
        return filtered.length > 0
    }

    function newChecklist() {
        props.card.checklists.push({"new": true})
        send()
    }

    function send() {
        props.ws.send(JSON.stringify({
            "action": "updateCard",
            "id": props.card.id,
            "boardId": props.card.boardId,
            "checklists": props.card.checklists
        }))
    }
</script>

<template>
    <div @contextmenu.stop="" @dragstart.prevent.stop="" draggable="true">
        <div @click="close" class="darken"></div>
        <div class="cardMenu">
            <EditableText :text="props.card.title" @edit="txt=>rename(txt)" class="title"/>
            <EditableText :textarea="true" :text="props.card.description" @edit="txt=>editDesc(txt)" class="description"/>
            <div class="labels">
                <div @click="() => toggle(label)" v-for="label in props.labels">
                    <p :class="{label: true, disabled: !isEnabled(label)}" :style="{'color': label.textColor, 'background-color': label.color}">{{ label.title }}</p>
                </div>
            </div>
            <div class="checklistSection">
                <div v-for="checklist in props.card.checklists" class="checklists">
                    <Checklist @send="send" :checklist="checklist" />
                </div>
                <button class="newChecklistBtn" @click="newChecklist">New Checklist</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .checklistSection {
        margin-top: 1rem;
    }
    .newChecklistBtn {
        background-color: var(--color-btn-create);
        border-style: none;
        padding: .5rem 1rem;
        border-radius: 10px;
        font-size: 1rem;
    }
    .newChecklistBtn:hover {
        background-color: var(--color-btn-create-hover);
    }
    .checklists {
        width: 90%;
        margin: 10px 5%;
    }
    .disabled {
        opacity: 30%;
    }
    .label {
        border-radius: 10px;
        padding: .25rem .5rem;
        margin-left: 10px;
        margin-top: 10px;
        font-size: 1rem;
    }
    .labels {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        margin-bottom: 1rem;
    }

    :deep(.editable) {
        padding: .5rem 1rem;
        color: white
    }

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
        overflow-y: scroll;
        overflow-x: hidden;
        position: absolute;
        width: 80vw;
        height: 90vh;
        top: 5vh;
        left: 10vw;
        background-color: var(--color-background-light);
        border-color: var(--color-background-soft);
        border-style: solid;
        border-width: 7px;
        opacity: 100%;
        z-index: 6;
        border-radius: 10px;
        filter: drop-shadow(-5px 5px 5px black);
        scrollbar-width: thin;
        scrollbar-color: var(--color-background-mute) var(--color-background-light);
    }

    ::-webkit-scrollbar {
        height: 12px;
        width: 12px;
        background: var(--color-background-light);
    }

    ::-webkit-scrollbar-thumb {
        background: var(--color-background-mute);
        -webkit-border-radius: 10px;
    }

    .title {
        background-color: var(--color-card-primary);
        border-radius: 10px;
        color: var(--color-card-title);
    }

    .description {
        width: 90%;
        background-color: var(--color-background);
        margin: 10px 5%;
        height: 20%;
        border-radius: 10px;
        text-align: left;
    }

    .description :deep(textarea), .description :deep(p) {
        height: 100%;
        width: 100%;
        color: var(--color-text);
        font-size: 1rem;
    }
    .description :deep(p) {
        padding: 10px;
        font-size: .75rem;
    }

    @media (min-width: 1025px) {
        .cardMenu {
            width: 40vw;
            left: 30vw;
        }
        .description :deep(p) {
            font-size: 1rem;
        }
        .label {
            padding: .5rem 1rem;    
        }
        .checklists {
            width: 70%;
            margin: 10px 15%;
        }
    }
</style>