<script setup>
    let props = defineProps(["checklist"])
    let emit = defineEmits(["send"])

    function updateTitle(txt) {
        if (txt == "") {
            deleteList()
            return
        }
        if (props.checklist.title == "") {
            setTimeout(() => {
                newItem()
            }, 100)
        }
        props.checklist.title = txt
        emit("send")
    }

    function newItem() {
        props.checklist.ChecklistItems.push({
            "new": true,
            "title": ""
        })
    }

    function deleteList() {
        props.checklist.delete = true
        emit("send")
    }

    function send(item) {
        if (!item.new && (item.title == undefined || item.title == "")) return
        props.checklist.ChecklistItems = props.checklist.ChecklistItems.filter(el => {return !(el.new && el.delete)})
        emit('send')
    }
</script>

<template>
    <div class="checklist">
        <div class="titleContainer">
            <button class="delete" @click="deleteList"></button>
            <EditableText :maxlength="20" :focus="props.checklist.title==''" class="title" :text="props.checklist.title" @edit="txt=>updateTitle(txt)"/>
        </div>
        <div v-for="item in props.checklist.ChecklistItems">
            <ChecklistItem @newItem="newItem" @send="()=>send(item)" :item="item" />
        </div>
        <button class="newItemBtn" @click="newItem" v-if="props.checklist.title"></button>
    </div>
</template>

<style scoped>
    .titleContainer {
        display: flex;
        flex-direction: row;
    }
    .title {
        text-align: left;
        color: var(--color-cardmenu-checklist-title);
    }
    .delete {
        background-color: var(--color-cardmenu-checklist-delete);
        border-style: none;
        padding: .5rem 1rem;
        border-radius: 10px;
        font-size: 1rem;
        mask: url(/trash-2.svg) no-repeat center;
    }
    .delete:hover {
        background-color: var(--color-cardmenu-checklist-delete-hover);
    }
    .newItemBtn {
        transform: scale(1.25);
        align-self: center;
        margin-right: 95%;
        background-color: var(--color-cardmenu-checklist-new-item);
        border-style: none;
        padding: 1rem 1rem;
        border-radius: 10px;
        font-size: 1rem;
        mask: url(/plus-square.svg) no-repeat center;
    }
    .newItemBtn:hover {
        background-color: var(--color-cardmenu-checklist-new-item-hover);
    }
    .checklist {
        padding: 0 0 1rem 0;
        border-radius: 10px;
        margin-top: 1.5rem;
        width: 100%;
    }
</style>