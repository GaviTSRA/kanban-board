<script setup> 
    let props = defineProps(["list"])
</script>

<template>
    <div class="list">
        <p>{{ props.list.title }}</p>
    </div>
</template>

<style scoped>
    .list {
        margin-left: 1rem;
        margin-top: 10px;
        background-color: var(--color-background-mute);
        width: 10vw;
        max-width: 10vw;
        text-align: center;
        font-size: 1.5rem;
        border-radius: 10px;
    }
</style>