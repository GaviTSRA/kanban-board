<script setup lang="ts">
    const props = defineProps<{
        data: string
    }>()
    const emit = defineEmits<{
        delete: []
    }>()
</script>

<template>
    <div class="imageContainer">
        <img :src="props.data"/>
        <div class="delete" @click="$emit('delete')"></div>
    </div>
</template>

<style scoped>
    .imageContainer {
        display: flex;
        flex-direction: row;
        padding: 0;
        margin-left: 0;
    }
    img {
        border-radius: 10px;
        height: 10rem;
    }
    .delete {
        margin-top: auto;
        background-color: var(--color-white-4);
        mask: url(/trash-2.svg) no-repeat center;
        padding: 1rem;
    }
</style>