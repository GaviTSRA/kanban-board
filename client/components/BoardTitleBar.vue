<script setup>
    let props = defineProps(["board"])
    let board = props.board
</script>

<template>
    <div class="header">
        <!-- TODO icon? -->
        <NuxtLink to="/" class="back">Back</NuxtLink>
        <p class="title">{{ board.title }}</p>
        <p class="description">{{ board.description }}</p>
    </div>
</template>

<style scoped>
    .back {
        margin: auto 10px;
        margin-right: 2rem;
        border-radius: 3px;
        padding: 2px 5px;
    }
    .header {
        display: flex;
        flex-direction: row;
        top: 0;
        left: 0;
        width: 100vw;
        height: 7vh;
        background-color: var(--color-background-mute);
        overflow: hidden;
    }

    .title {
        font-size: 1.5rem;
        margin: 10px;
        color: aqua
    }

    .description {
        margin: auto 0;
        margin-left: 1rem;
        width: 30vw;
    }
</style>