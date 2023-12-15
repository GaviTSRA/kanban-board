<script setup>
    let props = defineProps(["item"])
    let emit = defineEmits(["send", "newItem"])

    async function rename(txt) {
        if (txt == "") {
            deleteItem()
            return
        }
        let createNew
        if (props.item.title == "") {
            createNew = true
        }
        props.item.title = txt
        emit("send")
        if (createNew) {
            setTimeout(() => {
                emit("newItem")
            }, 100)
        }
    }

    function deleteItem() {
        props.item.delete = true
        emit("send")
    }

    function check() {
        emit("send")
    }
</script>

<template>
    <div class="item">
        <input @change="check" :value="props.item.checked" v-model="props.item.checked" class="checkbox" type="checkbox"/>
        <EditableText :maxlength="20" :focus="props.item.title == ''" :class="{checked: props.item.checked}" :text="props.item.title" @edit="txt=>rename(txt)"/>
        <button class="deleteBtn" @click="deleteItem"><img src="/trash-2.svg"/></button>
    </div>
</template>

<style scoped>
    .deleteBtn {
        margin-left: 1rem;
        margin-right: 10px;
        background-color: var(--color-cardmenu-checklist-delete-item);
        border-radius: 10px;
        border-style: none;
        margin-left: auto;
    }
    .checked {
        text-decoration: line-through;
        text-decoration-color: black;
        text-decoration-thickness: 3px;
    }
    .checkbox {
        width: fit-content;
        min-width: 1rem;
        margin-right: 10px;
    }
    .item {
        width: 70%;
        margin: 0;
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        border-radius: 10px;
        font-size: 1rem;
        text-align: left;
    }

    input[type="checkbox"] {
        transform:scale(1.5)
    }
</style>