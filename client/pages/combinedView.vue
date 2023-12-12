<script setup lang="ts">
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
        subcards?: number,
        ws: WebSocket,
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
        textColor: string,
        ws: WebSocket
    }

    let board = ref({
        id: route.params.id as string,
        title: "Combined View", 
        description: ""
    })
    let lists: Ref<List[]> = ref([])
    let cards: Ref<{[listId: string]: Card[]}> = ref({})
    let labels: Ref<Label[]> = ref([])
    let assignedLabels: Ref<{[labelId:string]: string}[]> = ref([])

    let boards = useLocalStorage("combinedViewBoards", [])
    let wss: {[boardId: string]: WebSocket} = {}

    for (let b of boards.value) {
        let ws = new WebSocket("ws://localhost:3001/board/"+b)
        ws.onclose = () => {
            window.location.href = "/"
        }
        ws.onmessage = wsMsgHandler
        wss[b] = ws
    }

    let boardNames: {[id: string]: string} = {}
    let listIdOverrides: {[id: string]: string} = {}

    function wsMsgHandler(msg) {
        const data = JSON.parse(msg.data)

        let found
        switch(data.type) {
            case "board":
                boardNames[data.id] = data.title
                if (board.value.description != "") board.value.description += ", "
                board.value.description += data.title
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
                    if (list.title == data.title) {
                        found = true
                        listIdOverrides[data.id] = list.id
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
                let listId = data.listId
                if (listId in listIdOverrides) listId = listIdOverrides[listId]

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
                for (const [_listId, listCards] of Object.entries(cards.value)) {
                    for (let card of listCards) {
                        if (card.id == data.id) {
                            if (listId != card.listId) {
                                cards.value[card.listId] = listCards.filter(c => c.id != card.id)
                                break
                            }
                            card.title = data.title
                            card.boardId = data.boardId
                            card.position = data.position
                            card.description = data.description
                            card.listId = listId
                            card.checklists = checklists
                            card.cardId = data.cardId
                            found = true
                            break
                        }
                    }
                }
                if (!found) {
                    cards.value[listId as string].push({
                        id: data.id,
                        title: data.title,
                        description: data.description,
                        position: data.position,
                        boardId: data.boardId,
                        listId: listId,
                        cardId: data.cardId,
                        checklists: checklists,
                        ws: wss[data.boardId]
                    })
                }
                for (const [listId, listCards] of Object.entries(cards.value)) {
                    cards.value[listId] = listCards.sort((a: Card, b: Card) => a.position < b.position ? -1 : 1)
                    for (let card of listCards) {
                        card.subcardCount = 0
                        card.subcardsDone = 0
                        card.subcards = 0
                        for (const [listId2, listCards2] of Object.entries(cards.value)) {
                            for (let card2 of listCards2) {
                                if (card.id == card2.cardId) {
                                    card.subcards++
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
                        textColor: data.textColor,
                        ws: wss[data.boardId]
                    })
                }
                break

            case "assignedLabel":
                found = false
                if (data.remove) {
                    assignedLabels.value = assignedLabels.value.filter(el => {
                        return el.labelId != data.labelId || el.cardId != data.cardId
                    })
                } else {
                    assignedLabels.value.push({
                        cardId: data.cardId,
                        labelId: data.labelId
                    })
                }
                break
        }
    }

    let settingsOpened = ref(false)

    function deleteCard(index: number, id: string) {
        for (let card of cards.value[id]) {
            if ((card.position > index)) {
                wss[card.boardId].send(JSON.stringify({
                    "action": "updateCard",
                    "boardId": wss[card.boardId],
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
            for (let list of lists.value) {
                for (let _card of cards.value[list.id]) {
                    if (_card.cardId == subCard.id) subcards.push(_card)
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
        for (let list of lists.value) {
            for (let subcard of cards.value[list.id]) {
                if (subcard.cardId == card.id) subcards.push(subcard)
            }
        }

        if(!checkChildren(subcards, card)) {
            
            return
        }
        if (card.boardId != assigningTo.value?.boardId) return
        wss[card.boardId].send(JSON.stringify({
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
</script>

<template>
    <div>
        <BoardTitleBar :editable="false" @settings="settingsOpened = !settingsOpened" :board="board" :ws="undefined"/>
        <Settings :creationEnabled="false" v-if="settingsOpened" :ws="undefined" :label-has-own-ws="true" :labels="labels"/>
        <button @click="stopAssigning" v-if="assigningSubCards" class="stopAssigning">Stop assigning</button>
        <div class="lists">
            <div v-for="(list, index) in lists">
                <div class="listAndDropSpot">
                    <List 
                        @ctxMenuAction="action=>{}" 
                        @dragstart="()=>{}" 
                        @drag-start="card=>{}"
                        @drop="index=>{}"
                        @delete-card="(i, id)=>deleteCard(i, id)"
                        @assign="card=>assignCard(card)"
                        @start-assign="card=>startAssign(card)"
                        @hover="card=>hoverCard(card)"
                        @hoverEnd="hoverEndCard"
                        :card-has-own-ws="true"
                        :list="list" 
                        :cards="cards[list.id]" 
                        :ws="wss[list.boardId]"
                        :is-dragging-card="false"
                        :draggingCard="false"
                        :labels="labels"
                        :assigned-labels="assignedLabels"
                        :assigningSubCards="assigningSubCards"
                        :assigningTo="assigningTo"
                        :board-names="boardNames"
                        :allowCreation="false"
                        :all-cards="cards"
                        :all-lists="lists"
                        draggable="true"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .listAndDropSpot {
        display: flex;
        margin-left: 1rem;
    }

    .lists {
        overflow: auto;
        display: flex;
        flex-direction: row;
        width: 100vw;
        height: 93vh;
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