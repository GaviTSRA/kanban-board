<script setup lang="ts">
    const route = useRoute()
    const { data } = await useFetch('http://localhost:3001')
    const boards = JSON.parse(data.value) 

    let creatingNewBoard = ref(false)
    let title = ref("")
    let description = ref("")

    interface createResponse {
        id: string
    }

    async function createBoard() {
        let res = (await useFetch<createResponse>("http://localhost:3001", {
            method: "POST",
            body: JSON.stringify({
                title: title.value,
                description: description.value
            })
        })).data
        console.log(res.value)
        await navigateTo("/board/" + res.value?.id)
    }
</script>

<template>
    <div class="container">
        <div v-for="board in boards">
            <BoardCard :board="board"/>
        </div>
        <button class="newBoardBtn" @click="creatingNewBoard = true">New Board</button>
    </div>
    <div class="create" v-if="creatingNewBoard">
        <h1>Create new board</h1>
        <label for="title">Title</label>
        <input v-model="title" type="text" id="title"/>
        <label for="description">Description</label>
        <textarea v-model="description" id="description"/>
        <button class="confirm" @click="createBoard">Create</button>
        <button class="cancel" @click="creatingNewBoard = false">X</button>
    </div>
</template>

<style scoped>
    .create {
        display: flex;
        flex-direction: column;
        background-color: var(--color-background-light);
        position: absolute;
        width: 30vw;
        height: 75vh;
        top: 12.5vh;
        left: 35vw;
        border-radius: 20px;
        filter: drop-shadow(0 0 300px black)
    }
    .create h1 {
        align-self: center;
        font-size: 3rem;
    }
    .create label {
        width: 25vw;
        align-self: center;
        margin-top: 20px;
    }
    .create input, .create textarea {
        width: 25vw;
        height: 2vw;
        align-self: center;
        background-color: var(--color-background);
        border-color: var(--color-background-soft);
        border-radius: 10px;
        color: white;
        resize: none;
    }
    #description {
        height: 7vw;
    }
    .create .confirm {
        margin-top: auto;
        margin-bottom: 30px;
        width: 10vw;
        align-self: center;
        height: 5vh;
        font-size: 2rem;
        background-color: var(--color-btn-create);
        border-style: solid;
        border-color: var(--color-btn-create-hover);
        border-radius: 10px;
    }
    .create .cancel {
        position: absolute;
        right: 10px;
        top: 5px;
        background-color: var(--color-background-light);
        border-style: none;
        font-size: 2rem;
    }

    .create .confirm:hover {
        background-color: var(--color-btn-create-hover);
    }

    .newBoardBtn {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: var(--color-btn-create);
        border-style: none;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-size: 2rem;
    }
    .newBoardBtn:hover {
        background-color: var(--color-btn-create-hover);
    }
    .newBoardBtn:active {
        background-color: aqua;
    }
    .container {
        display: flex;
        justify-self: center;
        flex-direction: column;
    }
</style>