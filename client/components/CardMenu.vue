<script setup>
    let props = defineProps(["card", "ws", "labels", "assignedLabels"])
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
</script>

<template>
    <div @contextmenu.stop="">
        <div @click="close" class="darken"></div>
        <div class="cardMenu">
            <EditableText :text="props.card.title" @edit="txt=>rename(txt)" class="title"/>
            <EditableText :textarea="true" :text="props.card.description" @edit="txt=>editDesc(txt)" class="description"/>
            <div class="labels">
                <div @click="() => toggle(label)" v-for="label in props.labels">
                    <p :class="{label: true, disabled: !isEnabled(label)}" :style="{'color': label.textColor, 'background-color': label.color}">{{ label.title }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .disabled {
        opacity: 30%;
    }
    .label {
        border-radius: 10px;
        padding: .5rem 1rem;
        margin-left: 10px;
        margin-top: 10px;
    }
    .labels {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
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
        font-size: 1rem;
    }

    .description :deep(textarea), .description :deep(p) {
        height: 100%;
        width: 100%;
        color: var(--color-text);
        font-size: 1rem;
    }
    .description :deep(p) {
        padding: 10px;
    }
</style>