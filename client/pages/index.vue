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

    let selectingForCombinedView = ref(false)
    let selected: Ref<string[]> = ref([])

    function saveSelected() {
        let storage = useLocalStorage("combinedViewBoards", [])
        storage.value = selected.value
    }
    function change(boardId: string) {
        if (selected.value.includes(boardId)) selected.value = selected.value.filter(e=>e != boardId)
        else selected.value.push(boardId)
    }
</script>

<template>
    <div class="container">
        <div class="cards">
            <div v-for="board in boards" class="cardContainer">
                <input @change="()=>change(board.id)" class="combinedViewCheckbox" type="checkbox" v-if="selectingForCombinedView"/>
                <BoardCard :board="board" :selectingForCombinedView="selectingForCombinedView"/>
            </div>
            <div class="newBoardItem cardContainer" @click="openNewBoardMenu">
                <div></div>
            </div>
        </div>
        <button class="combinedViewBtn" v-if="!selectingForCombinedView" @click="selectingForCombinedView = true">Select for combined view</button>
        <NuxtLink :to="selected.length >= 2 ? '/combinedView' : null" event="" @click.native="saveSelected" :class="{'combinedViewBtn': true, disabled: selected.length < 2}" v-if="selectingForCombinedView">Open combined view</NuxtLink>
    </div>
    <div class="create" v-if="creatingNewBoard" v-click-away="closeNewBoardMenu">
        <h1>Create new board</h1>
        <label for="title">Title</label>
        <input maxlength="20" v-model="title" type="text" id="title"/>
        <label for="description">Description</label>
        <textarea maxlength="125" v-model="description" id="description"/>
        <button class="confirm" @click="createBoard">Create</button>
    </div>
</template>

<style scoped>
    .cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
    }
    .combinedViewCheckbox {
        transform: scale(2);
        margin: auto 1rem;
        height: fit-content;
    }
    .cardContainer {
        display: flex;
        height: 40vh;
        width: 20vw;
        margin: 10px;
    }
    .newBoardItem {
        display: flex;
        align-items: center;
        justify-content: center;
        border-style: dotted;
        border-radius: 10px;
        background-color: var(--color-boardmenu-newitem-background);
        border-color: var(--color-boardmenu-newitem-border);
        transition: .5s;
    }
    .newBoardItem:hover {
        background-color: var(--color-boardmenu-newitem-background-hover);
        border-color: var(--color-boardmenu-newitem-border-hover);
    }
    .newBoardItem > div {
        transition: .4s;
        padding: 5rem;
        transform: scale(2.5);
        background-color: var(--color-boardmenu-newitem-icon);
        mask: url(/plus-circle.svg) no-repeat center;
    }
    .newBoardItem:hover > div {
        background-color: var(--color-boardmenu-newitem-icon-hover);
    }
    .combinedViewBtn {
        position: absolute;
        color: black;
        right: 10px;
        bottom: 4rem;
        padding: 1rem 2rem;
        font-size: 1rem;
        background-color: var(--color-boardmenu-combinedview-btn);
        border-style: none;
        border-radius: 10px;
    }
    .combinedViewBtn:hover {
        background-color: var(--color-boardmenu-combinedview-btn-hover);
    }
    .combinedViewBtn:active {
        background-color: var(--color-boardmenu-combinedview-btn-active);
    }
    .disabled {
        background-color: var(--color-boardmenu-combinedview-btn-disabled);
    }
    .disabled:hover {
        background-color: var(--color-boardmenu-combinedview-btn-disabled);   
    }
    .create {
        display: flex;
        flex-direction: column;
        background-color: var(--color-boardcreate-background);
        position: fixed;
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
        transition: 0.3s;
        margin-top: auto;
        margin-bottom: 30px;
        width: 10rem;
        align-self: center;
        font-size: 2rem;
        background-color: var(--color-boardcreate-createbtn);
        border-radius: 10px;
        height: fit-content;
        border-style: none;
    }
    
    .create .confirm:hover {
        background-color: var(--color-boardcreate-createbtn-hover);
    }
    .create .confirm:active {
        background-color: var(--color-boardcreate-createbtn-active);
    }
    .container {
        display: flex;
        justify-self: center;
        flex-direction: column;
    }

    ::-webkit-scrollbar {
        height: 12px;
        width: 12px;
        background: var(--color-list-background);
    }

    ::-webkit-scrollbar-thumb {
        background: var(--color-list-scrollbar);
        -webkit-border-radius: 10px;
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
        .combinedViewBtn {
            left: 10px;
            top: 10px;
            bottom: auto;
            right: auto;
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