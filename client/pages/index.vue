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
        width: 80vw;
        left: 10vw;
        height: 75vh;
        top: 12.5vh;
        border-radius: 20px;
        filter: drop-shadow(0 0 300px black);
    }
    .create h1 {
        align-self: center;
        font-size: 1.5rem;
    }
    .create label {
        width: 25vw;
        align-self: center;
        margin-top: 20px;
        font-size: 1rem;
        text-align: center;
    }
    .create input, .create textarea {
        width: 50vw;
        height: 5vh;
        align-self: center;
        background-color: var(--color-background);
        border-color: var(--color-background-soft);
        border-radius: 10px;
        color: white;
        resize: none;
    }
    #description {
        height: 40vw;
    }
    .create .confirm {
        margin-top: auto;
        margin-bottom: 30px;
        width: 10rem;
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
        font-size: 1rem;
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

    @media (min-width: 1025px) {
        .create {
            width: 30vw;
            left: 35vw;
        }
        .create h1 {
            font-size: 3rem;
        }
        .create label {
            text-align: left;
        }
        .create input, .create textarea {
            height: 2vw;
            width: 25vw;
        }
        #description {
            height: 7vw;
        }
        .newBoardBtn {
            font-size: 2rem;
        }
    }
    </style>