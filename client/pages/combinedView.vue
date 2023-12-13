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
    let allLists: Ref<List[]> = ref([])
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
                        allLists.value.push({
                            id: data.id,
                            title: data.title,
                            position: data.position,
                            boardId: data.boardId
                        })
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
                    cards.value[listId] = listCards.sort((a: Card, b: Card) => {
                        if (a.boardId != b.boardId) return a.boardId > b.boardId ? -1 : 1
                        return a.position < b.position ? -1 : 1
                    })
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

</script>

<template>
    <Board 
        :isCombinedView="true"
        :ws="undefined"
        :wss="wss"
        :board="board"
        :lists="lists"
        :all-lists="allLists"
        :cards="cards"
        :labels="labels"
        :assignedLabels="assignedLabels"
        :list-id-overrides="listIdOverrides"
        :board-names="boardNames"
    />
</template>
