<script setup lang="ts">
    const route = useRoute()
    const { data } = await useFetch('http://localhost:3001')
    const boards = JSON.parse(data.value as string) 

    let creatingNewBoard = ref(false)
    let title = ref("")
    let description = ref("")

    interface createResponse {
        id: string
    }

    let canCloseNewBoardMenu = false
    function openNewBoardMenu() {
        canCloseNewBoardMenu = false
        creatingNewBoard.value = true
        setTimeout(() => {
            canCloseNewBoardMenu = true
        }, 200)
    }
    function closeNewBoardMenu() {
        if (canCloseNewBoardMenu) creatingNewBoard.value = false
    }

    async function createBoard() {
        // TODO error handling
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
        <button class="newBoardBtn" @click="openNewBoardMenu">New Board</button>
    </div>
    <div class="create" v-if="creatingNewBoard" v-click-away="closeNewBoardMenu">
        <h1>Create new board</h1>
        <label for="title">Title</label>
        <input v-model="title" type="text" id="title"/>
        <label for="description">Description</label>
        <textarea v-model="description" id="description"/>
        <button class="confirm" @click="createBoard">Create</button>
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
        font-size: 2rem;
        background-color: var(--color-btn-create);
        border-style: solid;
        border-color: var(--color-btn-create-hover);
        border-radius: 10px;
        height: fit-content;
    }
    
    .create .confirm:hover {
        background-color: var(--color-btn-create-hover);
    }
    
    .newBoardBtn {
        position: fixed;
        bottom: 10px;
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
            width: 40vw;
            left: 30vw;
        }

        .create h1 {
            font-size: 3rem;
        }
        .create label {
            text-align: center;
        }
        .create input, .create textarea {
            height: 3vw;
            width: 25rem;
        }
        #description {
            height: 7vw;
        }
        .newBoardBtn {
            font-size: 2rem;
            top: 10px;
            right: 10px;
            bottom: auto;
        }
    }

    @media (min-width: 1600px) {
        .create {
            width: 30vw;
            left: 35vw;
        }

        .create input, .create textarea {
            height: 2vw;
            width: 25rem;
        }
    }
    </style>