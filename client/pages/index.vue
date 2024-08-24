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
    let selected: Ref<string[]> = useLocalStorage("combinedViewBoards", [])

    function change(boardId: string) {
        if (selected.value.includes(boardId)) selected.value = selected.value.filter(e=>e != boardId)
        else selected.value.push(boardId)
    }

    let settingsOpened = ref(false)
</script>

<template>
    <ThemeHandler />
    <div class="header">
        <p class="title">Kanban Boards</p>
        <button class="combinedViewBtn" @click="selectingForCombinedView = true"></button>
        <button @click="settingsOpened = !settingsOpened" class="settingsButton"></button>
    </div>
    <UserSettings v-if="settingsOpened"/>
    <div class="container">
        <div class="cards">
            <div v-for="board in boards" class="cardContainer">
                <BoardCard :board="board" :selectingForCombinedView="selectingForCombinedView"/>
            </div>
            <div class="newBoardItem cardContainer" @click="openNewBoardMenu">
                <div></div>
            </div>
        </div>
    </div>
    <div class="create" v-if="creatingNewBoard" v-click-away="closeNewBoardMenu">
        <h1>Create new board</h1>
        <label for="title">Title</label>
        <input maxlength="20" v-model="title" type="text" id="title"/>
        <label for="description">Description</label>
        <textarea maxlength="125" v-model="description" id="description"/>
        <button class="confirm" @click="createBoard">Create</button>
    </div>
    <div class="darken"  v-if="selectingForCombinedView" @click="selectingForCombinedView = false"></div>
    <div class="selectCombinedView" v-if="selectingForCombinedView">
    <h1 class="selectHeader">Select boards for combined view</h1>
    <hr>
    <div v-for="board in boards" class="boardItem">
        <Switch :value="selected.includes(board.id)" @change="()=>change(board.id)" class="combinedViewCheckbox"/>
            <p>{{ board.title }}</p>
        </div>
        <NuxtLink :to="selected.length >= 2 ? '/combinedView' : null" :class="{'openCombinedViewBtn': true, disabled: selected.length < 2}">Open</NuxtLink>
    </div>
</template>

<style scoped>
    .settingsButton {
        margin: auto 0;
        margin-right: 1rem;
        height: 2rem;
        width: 2rem;
        background-color: var(--color-header-settings-btn);
        mask: url(/settings.svg) no-repeat center;
        transition: .6s;
    }
    .settingsButton:hover {
        transform: rotate(180deg);
    }
    .settingsButton:active {
        transition: 1s;
        transform: rotate(300deg);
    }
    .title {
        background-color: var(--color-header-title-background);
        padding: .5rem 1rem;
        border-radius: 10px;
        font-size: 1.5rem;
        margin: auto 10px;
        color: var(--color-header-title);
        height: fit-content;
    }
    .header {
        display: flex;
        flex-direction: row;
        top: 0;
        left: 0;
        width: 100vw;
        height: 7vh;
        min-height: 3rem;
        background-color: var(--color-header-background);
        overflow: hidden;
    }
    p {
        margin: auto 0;
    }
    hr {    
        margin-bottom: 3rem;
    }
    .selectHeader {
        text-align: center;
    }
    .openCombinedViewBtn {
        display: block;
        width:6rem;
        margin: 0 auto;
        margin-top: 6rem;
        padding: 1rem 2rem;
        border-radius: 10px;
        text-align: center;
        color: black;
        font-size: 1rem;
        background-color: var(--color-boardmenu-combinedview-open-btn);
    }
    .openCombinedViewBtn:hover {
        background-color: var(--color-boardmenu-combinedview-open-btn-hover);
    }
    .openCombinedViewBtn:active {
        background-color: var(--color-boardmenu-combinedview-btn-active);
    }
    .boardItem {
        display: flex;
        flex-direction: row;
        margin-top: 10px;
    }
    .darken {
        position: fixed;
        height: 100vh;
        width: 100vw;
        top: 0;
        left: 0;
        background-color: black;
        z-index: 2;
        opacity: 50%;
    }
    .selectCombinedView {
        position: fixed;
        width: 70vw;
        max-height: 80vh;
        padding-bottom: 1rem;
        background-color: var(--color-boardcreate-background);
        left: 15vw;
        top: 10vh;
        z-index: 56;
        border-radius: 10px;
    }
    .cards {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
    }
    .combinedViewCheckbox {
        margin: auto 10px;
    }
    .cardContainer {
        display: flex;
        height: 40vh;
        min-height: 20rem;
        width: 80vw;
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
        padding: 2rem;
        transform: scale(2.5);
        background-color: var(--color-boardmenu-newitem-icon);
        mask: url(/plus-circle.svg) no-repeat center;
    }
    .newBoardItem:hover > div {
        background-color: var(--color-boardmenu-newitem-icon-hover);
    }
    .combinedViewBtn {
        color: black;
        margin-left: auto;
        margin-right: 10px;
        padding: 1rem 1rem;
        font-size: 1rem;
        background-color: var(--color-boardmenu-combinedview-btn);
        border-style: none;
        border-radius: 10px;
        mask: url(/layers.svg) no-repeat center;
        transition: .2s;
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

    @media (min-width: 550px) {
        .cards {
            grid-template-columns: repeat(2, 1fr);
        }
        .cardContainer {
            width: 45vw;
            min-height: 25rem;
        }
    }

    @media (min-width: 1025px) {
        .selectCombinedView {
            width: 30vw;
            left: 35vw;
        }
        .cards {
            grid-template-columns: repeat(3, 1fr);
        }
        .cardContainer {
            width: 25vw;
        }
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