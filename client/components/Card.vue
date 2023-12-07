<script setup>
    let props = defineProps(["card", "ws", "showDropSpot"])
    let emit = defineEmits(["dragStart", "drop"])

    function getDescription() {
        let description = props.card.description
        if (description.length > 110) {
            let newDescription = ""
            let parts = description.split(" ")
            for (const part of parts) {
                if (newDescription.length + part.length < 110) newDescription += " " + part
            }
            if (newDescription == "") newDescription = description.substring(0, 110)
            description = newDescription + "..."
        }
        return description
    }

    let cardMenuVisible = ref(false)
    let dropSpotVisible = ref(false)
    let deleteMenuVisible = ref(false)

    let actions = [
        ["Delete card", "delete", true]
    ]
    let top = ref(0)
    let left = ref(0)
    let menuVisible = ref(false)
    async function openMenu(event) {
        top.value = event.y
        left.value = event.x
        
        menuVisible.value = true
        event.stopPropagation
    }

    function ctxMenuClicked(action) {
        menuVisible.value = false
        
        if(action == "delete")  {
            deleteMenuVisible.value = true
        }
    }

    function deleteCard() {
        props.ws.send(JSON.stringify({
            "action": "updateCard",
            "boardId": props.card.boardId,
            "id": props.card.id,
            "delete": true
        }))
        deleteMenuVisible.value = false
    }
</script>

<template>
    <div  @contextmenu="openMenu" draggable="true" @dragstart.stop="$emit('dragStart', props.card)">
        <div 
            @dragenter.prevent="dropSpotVisible = true"
            @dragover.prevent="dropSpotVisible = true" 
            @dragleave="dropSpotVisible = false"
            @drop="e=>{$emit('drop', index); dropSpotVisible = false}" 
            :class="{cardDropSpot: dropSpotVisible, cardDropSpotSmall: true}">
        </div>
        <div class="container" @click="() => cardMenuVisible = true">
            <p class="title">{{ props.card.title }}</p>
            <p v-if="props.card.description != undefined" class="description">{{ getDescription() }}</p>
        </div>
        <CardMenu :card="card" v-if="cardMenuVisible" @close="cardMenuVisible = false" :ws="props.ws"/>
        <ContextMenu :actions="actions" @action-clicked="ctxMenuClicked" :x="left" :y="top" v-if="menuVisible" v-click-away="() => menuVisible = false"/>
        <DecisionMenu v-if="deleteMenuVisible" @confirm="deleteCard" @cancel="deleteMenuVisible = false" optionOk="Confirm" text="Delete card?" optionCancel="Cancel"/>
    </div>
</template>

<style scoped>
    .cardDropSpotSmall {
        width: 100%;
        height: 15px;
    }
    .cardDropSpot {
        height: 4rem;
    }
    .container {
        background-color: var(--color-card-primary);
        border-radius: 10px;
        margin: 0 10px;
        text-align: left;
    }
    .title {
        margin-left: 10px;
        color: var(--color-card-title);
    }
    .description {
        color: var(--color-card-description);
        font-size: 1rem;
        line-height: 15px;
        padding: 10px;
    }
</style>