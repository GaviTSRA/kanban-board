<script setup lang="ts">
    const route = useRoute();
    let props = defineProps(["board"])
    let title: string = props.board["title"]
    if (title.length > 30) {
        let newTitle: string = ""
        let parts = title.split(" ")
        for (const part of parts) {
            if (newTitle.length + part.length < 30) newTitle += " " + part
        }
        if (newTitle == "") newTitle = title.substring(0, 30)
        title = newTitle + "..."
    }

    let description = props.board["description"]
    if (description.length > 140) {
        let newDescription: string = ""
        let parts = description.split(" ")
        for (const part of parts) {
            if (newDescription.length + part.length < 140) newDescription += " " + part
        }
        if (newDescription == "") newDescription = description.substring(0, 130)
        description = newDescription + "..."
    }
</script>

<template>
    <NuxtLink class="container" :to="'/board/'+props.board['id']">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
    </NuxtLink>
</template>

<style scoped>
    .container {
        display: flex;
        flex-direction: row;
        border-radius: 10px;
        background-color: rgb(42, 42, 42);
        width: 30vw;
        height: 10vh;
        max-height: 10vh;
        padding: .5rem 2rem;
        margin-bottom: 10px;
        align-items: center;
        justify-content: left;
        text-align: left;
    }
    h2 {
        color: aqua;
        width: 30%;
    }
    p {
        color: gray;
        margin-left: 1rem;
        width: 70%;
    }
</style>