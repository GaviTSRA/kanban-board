<script setup>
    let props = defineProps(["card", "ws", "showDropSpot", "labels", "assignedLabels"])
    let emit = defineEmits(["dragStart", "drop", "delete"])

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
        emit("delete")
    }

    function isEnabled(label) {
        let filtered = props.assignedLabels.filter(el => {
            return el.labelId == label.id && el.cardId == props.card.id
        })
        return filtered.length > 0
    }
</script>

<template>
    <div @contextmenu.prevent.stop="openMenu" draggable="true" @dragstart.stop="$emit('dragStart', props.card)">
        <div 
            @dragenter.prevent="dropSpotVisible = true"
            @dragover.prevent="dropSpotVisible = true" 
            @dragleave="dropSpotVisible = false"
            @drop="e=>{$emit('drop', index); dropSpotVisible = false}" 
            :class="{cardDropSpot: dropSpotVisible && props.showDropSpot, cardDropSpotSmall: true}">
        </div>
        <div class="container" @click="() => cardMenuVisible = true">
            <p class="title">{{ props.card.title }}</p>
            <p v-if="props.card.description != undefined" class="description">{{ getDescription() }}</p>
            <div class="labels">
                <div v-for="label in labels" >
                    <p v-if="isEnabled(label)" class="label" :style="{'color': label.textColor, 'background-color': label.color}">{{ label.title }}</p>
                </div>
            </div>
            <div v-if="props.card.checklists.length != 0" class="checklists">
                <div v-for="checklist in props.card.checklists" class="checklist">
                    <span 
                        :class="{progress: true, complete: checklist.ChecklistItems != undefined && checklist.ChecklistItems.filter(item=>item.checked).length == checklist.ChecklistItems.length}"
                    >{{ checklist.ChecklistItems?.filter(item=>item.checked).length }}/{{ checklist.ChecklistItems?.length }}</span> {{ checklist.title }}
                </div>
            </div>
        </div>
        <CardMenu :labels="props.labels" :assigned-labels="props.assignedLabels" :card="card" v-if="cardMenuVisible" @close="cardMenuVisible = false" :ws="props.ws"/>
        <ContextMenu :actions="actions" @action-clicked="ctxMenuClicked" :x="left" :y="top" v-if="menuVisible" v-click-away="() => menuVisible = false"/>
        <DecisionMenu v-if="deleteMenuVisible" @confirm="deleteCard" @cancel="deleteMenuVisible = false" optionOk="Confirm" text="Delete card?" optionCancel="Cancel"/>
    </div>
</template>

<style scoped>
    .progress {
        display: inline-block;
        padding: 0 .25rem;
        margin-top: 5px;
        text-align: center;
        width: 3rem;
        background-color: var(--color-background-soft);
        border-radius: 10px;
    }
    .complete {
        background-color: green;
    }
    .checklist {
        font-size: 1rem;
    }
    .checklists {
        height: fit-content;
        padding: 10px;
    }
    .label {
        font-size: 1rem;
        width:fit-content;
        padding: 0 .5rem;
        border-radius: 10px;
        margin: 3px;
        height: fit-content;
    }

    .labels {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

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
        filter: drop-shadow(-2px 2px 1px black)
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