<script setup>
    let props = defineProps(["list", "ws", "cards", "draggingCard", "isDraggingCard", "assignedLabels", "labels", "assigningSubCards", "assigningTo", "cardHasOwnWs", "boardNames", "allowCreation", "allLists", "allCards"])
    let emit = defineEmits(["ctxMenuAction", "dragStart", "drop", "assign", "startAssign", "hover", "hoverEnd"])

    function editName(txt) {
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
    async function openMenu(event) {
        top.value = event.y
        left.value = event.x
        
        menuVisible.value = true
    }

    function ctxMenuClicked(action) {
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
        <EditableText :editable="props.allowCreation" :text="props.list.title" @edit="txt=>editName(txt)" class="title"/>
        <ContextMenu :actions="actions" @action-clicked="ctxMenuClicked" :x="left" :y="top" v-if="menuVisible" v-all-click-away="() => menuVisible = false"/>
        <div class="cards">
            <div v-for="(card, index) in props.cards" :key="card.id">
                <Card 
                    :ws="props.cardHasOwnWs ? card.ws : props.ws" 
                    :card="card"
                    :labels="props.labels"
                    :assigned-labels="props.assignedLabels"
                    :showDropSpot="props.isDraggingCard && (props.draggingCard.listId != props.list.id || (index - draggingCard?.position > 1 || draggingCard?.position - index > 0))"
                    :assigningSubCards="props.assigningSubCards"
                    :assigningTo="props.assigningTo"
                    :board-name="props.boardNames ? props.boardNames[card.boardId] : ''"
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
        <form v-if="allowCreation" @submit.prevent="createCard" class="newCard">
            <input type="text" v-model="newCardName"/>
            <button @click="createCard"></button>
        </form>
    </div>
</template>

<style scoped>
    .title {
        height: 4vh;
        border-style: solid;
        border-color: var(--color-black-4);
        border-width: 0;
        border-bottom-width: 4px;
    }
    .cardDropSpot {
        height: 2rem;
        width: 100%;
    }
    .newCard {
        display: flex;
        padding: .5rem;
        border-color: var(--color-black-4);
        border-width: 0;
        border-top-width: 4px;
        border-style: solid;
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
    }

    .newCard button:hover {
        background-color: var(--color-card-new-btn-hover);
    }

    .newCard button:active {
        background-color: var(--color-card-new-btn-active);
    }


    :deep(.editable) {
        width: 50dvw;
        height: 3vh;
        color: var(--color-list-title);;
    }

    input {
        width: 50dvw;
        height: 3vh;
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
        max-height: 65vh;
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
        :deep(.editable) {
            width: 9vw;
        }
    }

    @media (min-height: 800px) {
        .cards {
            max-height: 75vh
        }
    }
</style>