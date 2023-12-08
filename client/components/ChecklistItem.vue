<script setup>
    let props = defineProps(["item"])
    let emit = defineEmits(["send"])

    function rename(txt) {
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
        <EditableText :class="{checked: props.item.checked}" :text="props.item.title" @edit="txt=>rename(txt)"/>
        <!-- TODO icon -->
        <button class="deleteBtn" @click="deleteItem">Delete</button>
    </div>
</template>

<style scoped>  
    .deleteBtn {
        margin-left: auto;
        margin-right: 10px;
        background-color: var(--color-btn-danger);
        border-radius: 10px;
        border-style: none;
        padding: .25rem .5rem;
    }
    .checked {
        text-decoration: line-through;
    }
    .checkbox {
        width: fit-content;
        min-width: 3rem;
    }
    .item {
        background-color: var(--color-card-primary);
        width: 95%;
        margin: 5px auto;
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        border-radius: 10px;
    }
</style>