<script setup>
    let props = defineProps(["checklist"])
    let emit = defineEmits(["send"])

    function updateTitle(txt) {
        props.checklist.title = txt
        emit("send")
    }

    function newItem() {
        props.checklist.ChecklistItems.push({
            "new": true
        })
        emit("send")
    }

    function deleteList() {
        props.checklist.delete = true
        emit("send")
    }
</script>

<template>
    <div class="checklist">
        <EditableText :text="props.checklist.title" @edit="txt=>updateTitle(txt)"/>
        <div v-for="item in props.checklist.ChecklistItems">
            <ChecklistItem @send="$emit('send')" :item="item" />
        </div>
        <button class="newItemBtn" @click="newItem">Add item</button>
        <button class="delete" @click="deleteList">Delete</button>
    </div>
</template>

<style scoped>
    .delete {
        background-color: var(--color-btn-danger);
        border-style: none;
        padding: .5rem 1rem;
        border-radius: 10px;
        font-size: 1rem;
        margin-left: 5rem;
    }
    .newItemBtn {
        background-color: var(--color-btn-create);
        border-style: none;
        padding: .5rem 1rem;
        border-radius: 10px;
        font-size: 1rem;
    }
    .newItemBtn:hover {
        background-color: var(--color-btn-create-hover);
    }
    .checklist {
        background-color: var(--color-background-mute);
        padding: 0 0 1rem 0;
        border-radius: 10px;
    }
</style>