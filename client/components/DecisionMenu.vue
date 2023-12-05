<script setup>
    defineEmits(["cancel", "confirm"])
    let props = defineProps(["text", "optionOk", "optionCancel"])
</script>

<template>
    <div class="deleteMenu">
        <p>{{ props["text"] }}</p>
        <div>
            <button @click="$emit('confirm')" class="btnOk">{{ props["optionOk"] }}</button>
            <button @click="$emit('cancel')" class="btnCancel">{{ props["optionCancel"] }}</button>
        </div>
    </div>
</template>

<style scoped>
    .deleteMenu {
        position: absolute;
        width: 20vw;
        left: 40vw;
        height: 20vh;
        top: 40vh;
        filter: drop-shadow(0 0 5rem black);
        background-color: var(--color-background-light);
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        text-align: center;
        z-index: 99999;
    }
    p {
        margin-top: 10px;
        font-size: 2rem;
    }
    button {
        margin-top: 50px;
        font-size: 1rem;
        border-style: none;
        padding: .5rem 1rem;
        margin-left: 10px;
        margin-right: 10px;
        border-radius: 5px;
    }
    .btnOk {
        background-color: var(--color-btn-create);
    }
    .btnOk:hover {
        background-color: var(--color-btn-create-hover);
    }
    .btnCancel {
        background-color: var(--color-btn-danger);
    }
    .btnCancel:hover {
        background-color: var(--color-btn-danger-hover);
    }
</style>