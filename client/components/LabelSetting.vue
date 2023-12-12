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
                "boardId": props.label.boardId,
                "id": props.label.id
            }))
        }
    }
</script>

<template>
    <div class="label" @contextmenu.prevent="openMenu">
        <ContextMenu :actions="actions" @action-clicked="ctxMenuClicked" :x="left" :y="top" v-if="menuVisible" v-click-away="() => menuVisible = false"/>
        <form @change="save" class="label">
            <input type="text" v-model="props.label.color" data-coloris class="labelColor" />
            <input type="text" v-model="props.label.textColor" data-coloris class="labelColor"/>
            <EditableText :text="props.label.title" class="labelName" :style="{'color': props.label.textColor, 'background-color': props.label.color}" @edit="txt=>{name = txt; save()}"/>
        </form>
    </div>
</template>

<style scoped>
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