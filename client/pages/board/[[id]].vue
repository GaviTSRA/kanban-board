<script setup lang="ts">
import { mergeProps } from 'vue';
import BoardTitleBar from '~/components/BoardTitleBar.vue';

    const route = useRoute()

    interface List {
        id: string,
        title: string,
        position: number,
        boardId: string
    }
    interface Card {
        id: string,
        title: string,
        description: string,
        position: number,
        listId: string,
        boardId: string,
        cardId: string,
        subcardCount?: number,
        subcardsDone?: number,
        checklists: {
            title: string,
            id: string,
            CardId: string,
            ChecklistItems: {
                title: string,
                id: string,
                checked: boolean,
                ChecklistId: string
            }[]
        }[]
    }
    interface Label {
        id: string,
        boardId: string,
        title: string,
        color: string,
        textColor: string
    }

    let board = ref({
        id: route.params.id as string,
        title: "", 
        description: ""
    })
    let lists: Ref<List[]> = ref([])
    let cards: Ref<{[listId: string]: Card[]}> = ref({})
    let labels: Ref<Label[]> = ref([])
    let assignedLabels: Ref<{[labelId:string]: string}[]> = ref([])

    let ws = new WebSocket("ws://localhost:3001/board/"+route.params.id)

    ws.onclose = () => {
        window.location.href = "/"
    }

    ws.onmessage = msg => {
        const data = JSON.parse(msg.data)

        let found
        switch(data.type) {
            case "board":
                board.value.title = data.title
                board.value.description = data.description
                break

            case "list":
                if (data.delete) {
                    lists.value = lists.value.filter(list => list.id != data.id)
                    break
                }

                found = false
                for (let list of lists.value) {
                    if (list.id == data.id) {
                        list.title = data.title
                        list.boardId = data.boardId
                        list.position = data.position
                        found = true
                        break
                    }
                }
                if (!found) {
                    if (!cards.value[data.id]) {
                        cards.value[data.id] = []
                    }
                    lists.value.push({
                        id: data.id,
                        title: data.title,
                        position: data.position,
                        boardId: data.boardId
                    })
                }
                lists.value = lists.value.sort((a, b) => a.position < b.position ? -1 : 1)
                break
            
            case "card":
                found = false
                let checklists = data.checklists
                if (data.checklists) {
                    checklists.sort((a, b) => new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1)
                    for (let checklist of checklists) {
                        checklist.ChecklistItems.sort((a, b) => new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1)
                    }
                } else {
                    checklists = []
                }
                for (const [listId, listCards] of Object.entries(cards.value)) {
                    for (let card of listCards) {
                        if (card.id == data.id) {
                            if (card.listId != data.listId) {
                                cards.value[listId] = listCards.filter(c => c.id != card.id)
                                break
                            }
                            card.title = data.title
                            card.boardId = data.boardId
                            card.position = data.position
                            card.description = data.description
                            card.listId = data.listId
                            card.checklists = checklists
                            card.cardId = data.cardId
                            found = true
                            break
                        }
                    }
                }
                if (!found) {
                    cards.value[data.listId as string].push({
                        id: data.id,
                        title: data.title,
                        description: data.description,
                        position: data.position,
                        boardId: data.boardId,
                        listId: data.listId,
                        cardId: data.cardId,
                        checklists: checklists
                    })
                }
                for (const [listId, listCards] of Object.entries(cards.value)) {
                    cards.value[listId] = listCards.sort((a: Card, b: Card) => a.position < b.position ? -1 : 1)
                    for (let card of listCards) {
                        card.subcardCount = 0
                        card.subcardsDone = 0
                        for (const [listId2, listCards2] of Object.entries(cards.value)) {
                            for (let card2 of listCards2) {
                                if (card.id == card2.cardId) {
                                    for (let checklist of card2.checklists) {
                                        for (let item of checklist.ChecklistItems) {
                                            card.subcardCount++
                                            if (item.checked) card.subcardsDone++
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                break
        
            case "label":
                if (data.delete) {
                    labels.value = labels.value.filter(label => label.id != data.id)
                    break
                }

                found = false
                for (let label of labels.value) {
                    if (label.id == data.id) {
                        label.title = data.title
                        label.boardId = data.boardId
                        label.color = data.color
                        label.textColor = data.textColor
                        found = true
                        break
                    }
                }
                if (!found) {
                    labels.value.push({
                        id: data.id,
                        title: data.title,
                        color: data.color,
                        boardId: data.boardId,
                        textColor: data.textColor
                    })
                }
                break

            case "assignedLabel":
                found = false
                assignedLabels.value.push({
                    cardId: data.cardId,
                    labelId: data.labelId
                })
                break
            
            case "clearAssignedLabels":
                assignedLabels.value = []
        }
    }

    let newListName = ref("")
    function createNewList() {
        if (newListName.value == "") return

        ws.send(JSON.stringify({
            "action": "updateList",
            "new": true,
            "position": lists.value.length,
            "boardId": board.value.id,
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
        if (draggingList?.position < index) index -= 1
        if (index < 0) index = 0
        dragging.value = false
        ws.send(JSON.stringify({
            "action": "updateList",
            "id": draggingList?.id,
            "boardId": board.value.id,
            "position": index
        }))

        for (let list of lists.value) {
            if (list.id == draggingList?.id) continue
            if (list.position < draggingList?.position && list.position >= index) {
                ws.send(JSON.stringify({
                    "action": "updateList",
                    "boardId": board.value.id,
                    "id": list.id,
                    "position": list.position += 1
                }))
            }
            if (list.position > draggingList?.position && list.position <= index) {
                ws.send(JSON.stringify({
                    "action": "updateList",
                    "boardId": board.value.id,
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
        if (draggingCard?.position < index && draggingCard?.listId == list.id) index -= 1
        if (index < 0) index = 0
        isDraggingCard.value = false
        ws.send(JSON.stringify({
            "action": "updateCard",
            "id": draggingCard?.id,
            "listId": list.id,
            "boardId": board.value.id,
            "position": index
        }))

        if (draggingCard?.listId != list.id) {
            for (let card of cards.value[draggingCard?.listId]) {
                if (card.id == draggingCard?.id) continue
                if (card.position > draggingCard?.position) {
                    ws.send(JSON.stringify({
                        "action": "updateCard",
                        "boardId": board.value.id,
                        "id": card.id,
                        "position": card.position -= 1
                    }))
                }
            }
        }
        for (let card of cards.value[list.id]) {
            if (card.id == draggingCard?.id) continue
            if (
                (card.listId == draggingCard?.listId && card.position < draggingCard?.position && card.position >= index) ||
                (list.id != draggingCard?.listId && card.position >= index) 
                ) {
                ws.send(JSON.stringify({
                    "action": "updateCard",
                    "boardId": board.value.id,
                    "id": card.id,
                    "position": card.position += 1
                }))
            }
            if ((list.id == draggingCard?.listId && card.position > draggingCard?.position && card.position <= index)) {
                ws.send(JSON.stringify({
                    "action": "updateCard",
                    "boardId": board.value.id,
                    "id": card.id,
                    "position": card.position -= 1
                }))
            }
        }

        let _subcards = []
        for (let list of lists.value) {
            for (let otherCard of cards.value[list.id]) {
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
            if (list.position == lists.value.length - 1) return
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
        ws.send(JSON.stringify({
            "action": "updateList",
            "boardId": board.value.id,
            "id": listToDelete.id,
            "delete": true
        }))
    }

    let settingsOpened = ref(false)

    function deleteCard(index: number, id: string) {
        for (let card of cards.value[id]) {
            if ((card.position > index)) {
                ws.send(JSON.stringify({
                    "action": "updateCard",
                    "boardId": board.value.id,
                    "id": card.id,
                    "position": card.position -= 1
                }))
            }
        }
    }

    let assigningSubCards = ref(false)
    let assigningTo: Ref<Card | undefined> = ref(undefined)
    function assignCard(card: Card) {
        ws.send(JSON.stringify({
            action: "updateCard",
            boardId: board.value.id,
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
        <BoardTitleBar @settings="settingsOpened = !settingsOpened" :board="board" :ws="ws"/>
        <Settings :creationEnabled="true" v-if="settingsOpened" :ws="ws" :labels="labels" :boardId="board.id"/>
        <button @click="stopAssigning" v-if="assigningSubCards" class="stopAssigning">Stop assigning</button>
        <div class="lists">
            <div v-for="(list, index) in lists">
                <div class="listAndDropSpot">
                    <div class="dragDropSpot" @drop="()=>drop(index)" @dragenter.prevent=""  @dragover.prevent="" v-if="dragging && (index - draggingList?.position > 1 || draggingList?.position - index > 0)"></div>
                    <List 
                        @ctxMenuAction="action=>listCtxAction(action, list)" 
                        @dragstart="()=>startDrag(list)" 
                        @drag-start="card=>startDragCard(card)"
                        @drop="index=>dropCard(list, index)"
                        @delete-card="(i, id)=>deleteCard(i, id)"
                        @assign="card=>assignCard(card)"
                        @start-assign="card=>startAssign(card)"
                        @hover="card=>hoverCard(card)"
                        @hoverEnd="hoverEndCard"
                        :cardHasOwnWs="false"
                        :list="list" 
                        :cards="cards[list.id]" 
                        :ws="ws"
                        :is-dragging-card="isDraggingCard"
                        :draggingCard="draggingCard"
                        :labels="labels"
                        :assigned-labels="assignedLabels"
                        :assigningSubCards="assigningSubCards"
                        :assigningTo="assigningTo"
                        :allowCreation="true"
                        draggable="true" 
                    />
                </div>
            </div>
            <div class="dragDropSpot last" @drop="()=>drop(lists.length)" @dragenter.prevent=""  @dragover.prevent="" v-if="dragging && Math.abs(lists.length - 1 - draggingList?.position) > 0"></div>
            <div class="newList">
                <input type="text" v-model="newListName"/>
                <button @click="createNewList">Create new list</button>
            </div>
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
        height: 93vh;
    }

    .newList {
        background-color: var(--color-list-background);
        width: 15rem;
        min-width: 15rem;
        height: fit-content;
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        margin-left: 1rem;
        margin-right: 1rem;
        align-items: center;
        border-radius: 10px;
    }

    .newList input {
        width: 75%;
        margin-top: 10px;
        height: 2rem;
    }

    .newList button {
        margin: 10px 0;
        background-color: var(--color-card-new-btn);
        border-style: none;
        border-radius: 10px;
        padding: .5rem 1rem;
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