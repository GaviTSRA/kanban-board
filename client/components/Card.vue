<script setup>
    let props = defineProps(["card", "ws"])

    let cardMenuVisible = ref(false)
</script>

<template>
    <div  @contextmenu.stop="">
        <div class="container" @click="() => cardMenuVisible = true">
            <p class="title">{{ props.card.title }}</p>
        </div>
        <CardMenu :card="card" v-if="cardMenuVisible" @close="cardMenuVisible = false" :ws="props.ws"/>
    </div>
</template>

<style scoped>
    .container {
        background-color: var(--color-background-light);
        border-radius: 10px;
        margin: 10px;
        text-align: left;
    }
    .title {
        margin-left: 10px;
    }
</style>