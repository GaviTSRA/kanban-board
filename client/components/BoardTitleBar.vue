<script setup>
    let props = defineProps(["board", "ws"])
    let board = props.board

    let newTitle = ref("")
    let newDescription = ref("")
    let editingTitle = ref(false)
    let editingDescription = ref(false)
    let timer
    let x
    let y
    function detectDoubleClick(event, which) {
        if (timer && Math.abs(x - event.x) < 10 && Math.abs(y - event.y) < 10) {
            newTitle.value = board.title
            newDescription.value = board.description
            x = 0
            y = 0
            clearTimeout(timer)
            if (which == "title")
                editingTitle.value = true
            else
                editingDescription.value = true
        } else {
            timer = setTimeout(() => {
                x = 0
                y = 0
            }, 500)
            x = event.x
            y = event.y
        }
    }

    function saveNew(which) {
        if (which == "title") {
            props.ws.send(JSON.stringify({
                "action": "updateBoard",
                "boardId": props.board.id,
                "title": newTitle.value
            }))
            editingTitle.value = false
        } else {
            props.ws.send(JSON.stringify({
                "action": "updateBoard",
                "boardId": props.board.id,
                "description": newDescription.value
            }))
            editingDescription.value = false
        }
    }
</script>

<template>
    <div class="header">
        <!-- TODO icon? -->
        <NuxtLink to="/" class="back">Back</NuxtLink>
        <p v-if="!editingTitle" class="title" @click="e=>detectDoubleClick(e, 'title')">{{ board.title }}</p>
        <input v-model="newTitle" type="text" class="title" v-if="editingTitle" v-click-away="e=>saveNew('title')"/>
        <p class="description" v-if="!editingDescription" @click="e=>detectDoubleClick(e, 'description')">{{ board.description }}</p>
        <input v-model="newDescription" type="text" class="description descriptionInput" v-if="editingDescription" v-click-away="e=>saveNew('description')"/>
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
        min-height: 1rem;
    }

    .descriptionInput {
        padding: 1rem;
    }
</style>