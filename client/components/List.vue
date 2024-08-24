<script setup lang="ts">
    const props = defineProps<{
        list: List,
        ws: WebSocket,
        cards: Card[],
        draggingCard: Card,
        isDraggingCard: boolean,
        assignedLabels: {[id: string]: string},
        labels: Label[],
        assigningSubCards: boolean,
        assigningTo: Card,
        allLists: List[],
        allCards: []
    }>()
    const emit = defineEmits<{
        ctxMenuAction: [action: string],
        dragStart: [card: Card],
        drop: [index: number],
        deleteCard: [index: number, listId: string]
        assign: [card: Card],
        startAssign: [card: Card],
        hover: [card: Card],
        hoverEnd: []
    }>()

    function editName(txt: string) {
        if (txt == "") return
        props.ws.send(JSON.stringify({
            "action": "updateList",
            "id": props.list.id,
            "boardId": props.list.boardId,
            "title": txt
        }))
    }

    let actions = [
        {
            name: "Move left",
            action: "moveLeft"
        },
        {
            name: "Move right",
            action: "moveRight"            
        },
        {
            name: "Delete list",
            action: "delete",
            danger: true
        }
    ]
    let top = ref(0)
    let left = ref(0)
    let menuVisible = ref(false)
    async function openMenu(event: { y: number; x: number; }) {
        top.value = event.y
        left.value = event.x
        
        menuVisible.value = true
    }

    function ctxMenuClicked(action: string) {
        menuVisible.value = false
        emit("ctxMenuAction", action)
    }

    let newCardName = ref("")
    function createCard() {
        if (newCardName.value == "") return
        props.ws.send(JSON.stringify({
            "action": "updateCard",
            "new": true,
            "title": newCardName.value,
            "boardId": props.list.boardId,
            "listId": props.list.id,
            "position": props.cards.length
        }))
        newCardName.value = ""
    }
</script>

<template>
    <div class="list" @contextmenu.prevent="openMenu">
        <EditableText :center="true" :maxlength="20" :text="props.list.title" @edit="(txt: string)=>editName(txt)" class="title"/>
        <ContextMenu :actions="actions" @action-clicked="ctxMenuClicked" :x="left" :y="top" v-if="menuVisible" v-all-click-away="() => menuVisible = false"/>
        <div class="cards">
            <div v-for="(card, index) in props.cards" :key="card.id">
                <Card 
                    :ws="props.ws" 
                    :card="card"
                    :labels="props.labels"
                    :assigned-labels="props.assignedLabels"
                    :showDropSpot="props.isDraggingCard && (props.draggingCard.listId != props.list.id || (index - draggingCard?.position > 1 || draggingCard?.position - index > 0))"
                    :assigningSubCards="props.assigningSubCards"
                    :assigningTo="props.assigningTo"
                    :all-cards="props.allCards"
                    :all-lists="props.allLists"
                    @drag-start="card=>$emit('dragStart', card)"
                    @drop="$emit('drop', index)"
                    @delete="$emit('deleteCard', index, list.id)"
                    @assign="$emit('assign', card)"
                    @startAssign="$emit('startAssign', card)"
                    @hover="$emit('hover', card)"
                    @hoverEnd="$emit('hoverEnd')"
                />
            </div>
            <div 
                @dragenter.prevent=""  
                @dragover.prevent="" 
                @drop="$emit('drop', props.cards.length)" 
                class="cardDropSpot">
            </div>
        </div>
        <div class="newCardContainer">
            <form @submit.prevent="createCard" class="newCard">
                <input type="text" v-model="newCardName" maxlength="255"/>
                <button @click="createCard"></button>
            </form>
        </div>
    </div>
</template>

<style scoped>
    .newCardContainer {
        box-shadow: 0px -4px 10px var(--color-shadow);
        position:relative;
        z-index: 5;
        padding: .5rem;
        min-height: 1.5rem;
        border-color: var(--color-list-outline);
        border-width: 0;
        border-top-width: 4px;
        border-style: solid;
    }
    .title {
        position: relative;
        height: 3rem;
        border-style: solid;
        border-color: var(--color-list-outline);
        border-width: 0;
        border-bottom-width: 4px;
        filter: drop-shadow(0px 4px 3px var(--color-shadow));
        z-index: 5;
    }
    .cardDropSpot {
        height: 2rem;
        width: 100%;
    }
    .newCard {
        filter: none;
        display: flex;
    }
    .newCard input {
        width: 85%;
        margin-right: 10px;
    }

    .newCard button {
        transform: scale(1.35);
        width: 15%;
        background-color: var(--color-card-new-btn);
        padding: .7rem;
        margin-top: 1px;
        background-color: black;
        mask: url(/plus-circle.svg) no-repeat center;
        transition: .4s;
    }

    .newCard button:hover {
        background-color: var(--color-card-new-btn-hover);
    }

    .newCard button:active {
        background-color: var(--color-card-new-btn-active);
    }


    .title :deep(.editable) {
        width: 50vw;
        height: 2rem;
        color: var(--color-list-title);
    }

    input {
        width: 50dvw;
        height: 2rem;
        color: var(--color-list-title);
    }

    .list {
        margin-left: 1rem;
        margin-top: 10px;
        background-color: var(--color-list-background);
        width: 20rem;
        text-align: center;
        font-size: 1.5rem;
        border-radius: 10px;
    }

    .cards {
        height: fit-content;
        max-height: 55vh;
        overflow: scroll;
        scrollbar-width: thin;
        scrollbar-color: var(--color-list-scrollbar) var(--color-list-background);
        overflow-x: hidden;
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
        :deep(.editable textarea, .editable input) {
            width: 9vw;
        }
    }

    @media (min-height: 800px) {
        .cards {
            max-height: 75vh
        }
    }
</style>