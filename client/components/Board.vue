<script setup lang="ts">
    const props = defineProps<{
        ws: WebSocket,
        board: Board,
        lists: List[],
        cards: {[listId: string]: Card[]},
        labels: Label[],
        assignedLabels: {[labelId:string]: string},
        allLists: List[] | undefined,
        infoItems: InfoItem[]
    }>()

    function send(data: any) {
        props.ws.send(data)
    }

    let newListName = ref("")
    function createNewList() {
        if (newListName.value == "") return

        send(JSON.stringify({
            "action": "updateList",
            "new": true,
            "position": props.lists.length,
            "boardId": props.board.id,
            "title": newListName.value
        }))

        newListName.value = ""
    }

    let dragging = ref(false)
    let draggingList: List | undefined = undefined
    function startDrag(list: List) {
        draggingList = list
        dragging.value = false
        dragging.value = true
    }
    
    let isDraggingCard = ref(false)
    let draggingCard: Card | undefined = undefined
    function startDragCard(card: Card) {
        isDraggingCard.value = false
        isDraggingCard.value = true
        draggingCard = card
    }

    function drop(index: number) {
        if (!draggingList) return

        if (draggingList.position < index) index -= 1
        if (index < 0) index = 0
        dragging.value = false
        send(JSON.stringify({
            "action": "updateList",
            "id": draggingList?.id,
            "boardId": props.board.id,
            "position": index
        }))

        for (let list of props.lists) {
            if (list.id == draggingList?.id) continue
            if (list.position < draggingList.position && list.position >= index) {
                send(JSON.stringify({
                    "action": "updateList",
                    "boardId": props.board.id,
                    "id": list.id,
                    "position": list.position += 1
                }))
            }
            if (list.position > draggingList.position && list.position <= index) {
                send(JSON.stringify({
                    "action": "updateList",
                    "boardId": props.board.id,
                    "id": list.id,
                    "position": list.position -= 1
                }))
            }
        }
    }

    let moveQueue: Ref<Card[]> = ref([])
    let listDroppedIn: Ref<{[id: string]: List}> = ref({})
    let indexDroppedIn: Ref<{[id: string]: number}> = ref({})
    let subcards: Ref<{[id: string]: Card[]}> = ref({})
    function dropCard(list: List, index: number) {
        if (!draggingCard) return;
        let droppedList = list

        let i = 0
        for (let card of props.cards[droppedList.id]) {
            if (card.boardId == draggingCard.boardId) {
                index -= i
                break
            }
            i++
        }

        if (index < 0) return

        if (draggingCard?.position < index && draggingCard?.listId == list.id) index -= 1
        if (index < 0) index = 0
        isDraggingCard.value = false
        send(JSON.stringify({
            "action": "updateCard",
            "id": draggingCard?.id,
            "listId": list.id,
            "boardId": draggingCard.boardId,
            "position": index
        }))

        if (draggingCard?.listId != list.id) {
            for (let card of props.cards[draggingCard?.listId]) {
                if (card.id == draggingCard?.id) continue
                if (card.position > draggingCard?.position) {
                    send(JSON.stringify({
                        "action": "updateCard",
                        "boardId": draggingCard.boardId,
                        "id": card.id,
                        "position": card.position -= 1
                    }))
                }
            }
        }
        for (let card of props.cards[list.id]) {
            if (card.id == draggingCard?.id) continue
            if (
                (card.listId == draggingCard?.listId && card.position < draggingCard?.position && card.position >= index) ||
                (list.id != draggingCard?.listId && card.position >= index) 
                ) {
                send(JSON.stringify({
                    "action": "updateCard",
                    "boardId": draggingCard.boardId,
                    "id": card.id,
                    "position": card.position += 1
                }))
            }
            if ((list.id == draggingCard?.listId && card.position > draggingCard?.position && card.position <= index)) {
                send(JSON.stringify({
                    "action": "updateCard",
                    "boardId": draggingCard.boardId,
                    "id": card.id,
                    "position": card.position -= 1
                }))
            }
        }

        let _subcards = []
        for (let list of props.lists) {
            for (let otherCard of props.cards[list.id]) {
                if (otherCard.cardId == draggingCard?.id) _subcards.push(otherCard)
            }
        }

        if (_subcards.length > 0) {
            moveQueue.value.push(draggingCard)
            listDroppedIn.value[draggingCard.id] = list
            indexDroppedIn.value[draggingCard.id] = index
            subcards.value[draggingCard.id] = _subcards
        }
    }

    function dragEnd() {
        dragging.value = false
        isDraggingCard.value = false
    }

    let deleteMenuVisible = ref(false)
    let listToDelete: List | undefined = undefined
    function listCtxAction(action: string, list: List) {
        if (action == "moveLeft") {
            if (list.position == 0) return
            startDrag(list)
            drop(list.position-1)
        }
        if (action == "moveRight") {
            if (list.position == props.lists.length - 1) return
            startDrag(list)
            drop(list.position+2)
        }
        if (action == "delete") {
            listToDelete = list
            deleteMenuVisible.value = true
        }
    }

    function deleteList() {
        deleteMenuVisible.value = false
        send(JSON.stringify({
            "action": "updateList",
            "boardId": props.board.id,
            //@ts-ignore
            "id": listToDelete.id,
            "delete": true
        }))
    }

    let settingsOpened = ref(false)
    let infoMenuOpened = ref(false)

    function deleteCard(index: number, id: string) {
        for (let card of props.cards[id]) {
            if ((card.position > index)) {
                send(JSON.stringify({
                    "action": "updateCard",
                    "boardId": card.boardId,
                    "id": card.id,
                    "position": card.position -= 1
                }))
            }
        }
    }

    function checkChildren(children: Card[], other: Card) {
        for (let subCard of children) {
            if (subCard.cardId == other.id) return false

            let subcards = []
            for (let list of props.lists) {
                for (let card of props.cards[list.id]) {
                    if (card.cardId == subCard.id) subcards.push(card)
                }
            }

            if (!checkChildren(subcards, other)) return false
        }
        return true
    }

    let assigningSubCards = ref(false)
    let assigningTo: Ref<Card | undefined> = ref(undefined)
    function assignCard(card: Card) {
        let subcards = []
        for (let list of props.lists) {
            for (let subcard of props.cards[list.id]) {
                if (subcard.cardId == card.id) subcards.push(subcard)
            }
        }

        if(!checkChildren(subcards, card)) {

            return
        }

        if (card.boardId != assigningTo.value?.boardId) return
        send(JSON.stringify({
            action: "updateCard",
            boardId: card.boardId,
            cardId: assigningTo.value?.id,
            id: card.id
        }))
    }
    function startAssign(card: Card) {
        assigningTo.value = card
        assigningSubCards.value = true
    }
    function hoverCard(card: Card) {
        if (!assigningSubCards.value) {
            assigningTo.value = card
        }
    }
    function hoverEndCard() {
        if (!assigningSubCards.value) {
            assigningTo.value = undefined
        }
    }
    function stopAssigning() {
        assigningTo.value = undefined
        assigningSubCards.value = false
    }

    function moveSubcards(card: Card) {
        let index = indexDroppedIn.value[card.id]
        for (let subcard of subcards.value[card.id]) {
            index++
            startDragCard(subcard)
            dropCard(listDroppedIn.value[card.id], index)
        }
    }
</script>


<template>
    <div @dragend="dragEnd">
        <BoardTitleBar @settings="settingsOpened = !settingsOpened; infoMenuOpened = false" :board="board" :ws="props.ws" @info="infoMenuOpened = !infoMenuOpened; settingsOpened = false"/>
        <InfoMenu :ws="ws" :items="infoItems" v-if="infoMenuOpened" :boardId="board.id"/>
        <Settings v-if="settingsOpened" :ws="ws" :labels="labels" :boardId="board.id"/>
        <button @click="stopAssigning" v-if="assigningSubCards" class="stopAssigning">Stop assigning</button>
        <div class="lists">
            <div v-for="(list, index) in lists">
                <div class="listAndDropSpot">
                    <div class="dragDropSpot" @drop="()=>drop(index)" @dragenter.prevent=""  @dragover.prevent="" v-if="dragging && draggingList && (index - draggingList.position > 1 || draggingList.position - index > 0)"></div>
                    <List 
                        @ctxMenuAction="(action: string)=>listCtxAction(action, list)" 
                        @dragstart="()=>startDrag(list)" 
                        @drag-start="(card: Card)=>startDragCard(card)"
                        @drop="(index: number)=>dropCard(list, index)"
                        @delete-card="(i: number, id: string)=>deleteCard(i, id)"
                        @assign="(card: Card)=>assignCard(card)"
                        @start-assign="(card: Card)=>startAssign(card)"
                        @hover="(card: Card)=>hoverCard(card)"
                        @hoverEnd="hoverEndCard"
                        :list="list" 
                        :cards="cards[list.id]" 
                        :ws="ws"
                        :is-dragging-card="isDraggingCard"
                        :draggingCard="draggingCard"
                        :labels="labels"
                        :assigned-labels="assignedLabels"
                        :assigningSubCards="assigningSubCards"
                        :assigningTo="assigningTo"
                        :all-cards="cards"
                        :all-lists="lists"
                    />
                </div>
            </div>
            <div class="dragDropSpot last" @drop="()=>drop(lists.length)" @dragenter.prevent=""  @dragover.prevent="" v-if="dragging && draggingList && Math.abs(lists.length - 1 - draggingList.position) > 0"></div>
            <form class="newList" @submit.prevent="createNewList">
                <input type="text" v-model="newListName" maxlength="20"/>
                <button @click="createNewList"></button>
            </form>
        </div>
        <DecisionMenu v-if="deleteMenuVisible" @confirm="deleteList" @cancel="deleteMenuVisible = false" optionOk="Confirm" text="Delete list?" optionCancel="Cancel"/>
        <DecisionMenu v-if="moveQueue.length > 0" @confirm="()=>moveSubcards(moveQueue.shift())" @cancel="moveQueue.shift()" optionOk="Confirm" :text="'Move subcards of '+moveQueue[0].title+'?'" optionCancel="Cancel"/>
    </div>
</template>

<style scoped>
    .last {
        margin-left: 1rem;
    }
    .listAndDropSpot {
        display: flex;
        margin-left: 1rem;
    }

    .dragDropSpot {
        margin-top: 10px;
        width: 2.5rem;
        background-color: var(--color-background);
        filter:contrast(60%);
        border-color: black;
        border-style: solid;
        border-radius: 10px;
        height: 2.5rem;
    }

    .lists {
        overflow: auto;
        display: flex;
        flex-direction: row;
        width: 100vw;
        height: 88vh;
    }

    .newList {
        background-color: var(--color-list-background);
        width: 15rem;
        min-width: 15rem;
        height: fit-content;
        display: flex;
        flex-direction: row;
        margin-top: 10px;
        margin-left: 1rem;
        margin-right: 1rem;
        align-items: center;
        border-radius: 10px;
        padding: .5rem;
    }

    .newList input {
        height: 2rem;
        width: 90%;
    }

    .newList button {
        transform: scale(1.35);
        width: 15%;
        background-color: var(--color-card-new-btn);
        padding: .7rem;
        margin-top: 1px;
        margin-left: 15px;
        background-color: black;
        mask: url(/plus-circle.svg) no-repeat center;
        transition: .4s;
    }

    .newList button:hover {
        background-color: var(--color-card-new-btn-hover);
    }

    .newList button:active {
        background-color: var(--color-card-new-btn-active)
    }

    .stopAssigning {
        background-color: var(--color-board-stop-assign);
        border-style: none;
        position: absolute;
        right: 1rem;
        bottom: 1rem;
        font-size: 2rem;
        padding: 1rem 2rem;
        color: white;
        border-radius: 10px;
    }

    .stopAssigning:hover {
        background-color: var(--color-board-stop-assign-hover);
    }

    .stopAssigning:active {
        background-color: var(--color-board-stop-assign-active);
    }
</style>