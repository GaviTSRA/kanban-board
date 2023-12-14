<script setup>
    import "@melloware/coloris/dist/coloris.css";
    import Coloris from "@melloware/coloris";
    Coloris.init();
    Coloris({
        el: "#coloris",
        themeMode: "dark",
        alpha: false
    });

    let props = defineProps(["label", "ws"])

    let name = ref(props.label.title)
    function save() {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "boardId": props.label.boardId,
            "id": props.label.id,
            "color": props.label.color,
            "textColor": props.label.textColor,
            "title": name.value
        }))
    }

    function deleteLabel() {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "delete": true,
            "boardId": props.label.boardId,
            "id": props.label.id
        }))
    }
</script>

<template>
    <div class="label" v-if="!label.empty">
        <form @change="save" class="label">
            <input type="text" v-model="props.label.color" data-coloris class="labelColor" />
            <input type="text" v-model="props.label.textColor" data-coloris class="labelColor"/>
            <EditableText :maxlength="20" :text="props.label.title" class="labelName" :style="{'color': props.label.textColor, 'background-color': props.label.color}" @edit="txt=>{name = txt; save()}"/>
            <button class="deleteBtn" @click.prevent="deleteLabel"><img src="/trash-2.svg"/></button>
        </form>
    </div>
</template>

<style scoped>
    .deleteBtn {
        margin-top: auto;
        margin-bottom: 0;
        margin-right: 10px;
        padding: .5rem;
        background-color: var(--color-cardmenu-checklist-delete-item);
        border-radius: 10px;
        border-style: none;
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
        height: fit-content;
        width: 5vw;
        margin: 10px;
    }
    .label {
        height: 2rem;
        display: flex;
        flex-direction: row;
        margin-top: 10px;
    }
</style>