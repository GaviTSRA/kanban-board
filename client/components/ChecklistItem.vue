<script setup>
    let props = defineProps(["item"])
    let emit = defineEmits(["send", "newItem"])

    function rename(txt) {
        if (txt == "") {
            deleteItem()
            return
        }
        if (props.item.title == "") {
            setTimeout(() => {
                emit("newItem")
            }, 100)
        }
        props.item.title = txt
        emit("send")
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
        <EditableText :focus="props.item.title==''" :class="{checked: props.item.checked}" :text="props.item.title" @edit="txt=>rename(txt)"/>
        <button class="deleteBtn" @click="deleteItem"><img src="/trash-2.svg"/></button>
    </div>
</template>

<style scoped>
    .deleteBtn {
        margin-left: 1rem;
        margin-right: 10px;
        background-color: rgba(0,0,0,0);
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
        min-width: 3rem;
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