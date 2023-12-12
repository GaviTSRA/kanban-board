<script setup>
    let props = defineProps(["card", "ws", "showDropSpot", "labels", "assignedLabels", "assigningSubCards", "assigningTo", "boardName", "allLists", "allCards"])
    let emit = defineEmits(["dragStart", "drop", "delete", "assign", "startAssign", "hover", "hoverEnd"])

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

    let labelMenu = []

    onBeforeUpdate(() => {
        labelMenu = []
        for (let label of props.labels) {
            labelMenu.push({
                name: (isEnabled(label) ? "Remove '" : "Add '") + label.title + "'",
                danger: isEnabled(label),
                action: "changeLabel:" + label.id   
            })
        }
        actions = [
            {
                name: "Labels",
                submenu: labelMenu
            },
            {
                name: "Assign sub cards",
                action: "assignSubCards"
            },
            {
                name: "Unasign",
                action: "unasign"
            },
            {
                name: "Delete card",
                action: "delete",
                danger: true
            }
        ]
    })

    let actions = []

    let top = ref(0)
    let left = ref(0)
    let menuVisible = ref(false)
    async function openMenu(event) {
        top.value = event.y
        left.value = event.x
        
        menuVisible.value = true
        event.stopPropagation
    }

    function isEnabled(label) {
        let filtered = props.assignedLabels.filter(el => {
            return el.labelId == label.id && el.cardId == props.card.id
        })
        return filtered.length > 0
    }

    function ctxMenuClicked(action) {
        menuVisible.value = false
        if (action.startsWith('changeLabel')) {
            let label = action.split(":")[1]
            props.ws.send(JSON.stringify({
                "action": "toggleLabel",
                "boardId": props.card.boardId,
                "cardId": props.card.id,
                "labelId": label
            }))
        }

        if(action == "delete")  {
            deleteMenuVisible.value = true
        }

        if (action == "assignSubCards") {
            emit("startAssign")
        }

        if (action == "unasign") {
            props.ws.send(JSON.stringify({
                action: "updateCard",
                boardId: props.card.boardId,
                id: props.card.id,
                cardId: "remove"
            }))
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

    function cardClick() {
        if (props.assigningSubCards) {
            emit("assign")
            return
        }
        cardMenuVisible.value = true
    }

    let notHiddenByMasterCard = useLocalStorage("showSubCards-"+props.card.cardId, true)
    let notHiddenByBoard = useLocalStorage("showSubCards", true)
    let forceShowAll = useLocalStorage("showAllCards", false)
    watch(
        () => props.card.cardId,
        () => notHiddenByMasterCard = useLocalStorage("showSubCards-"+props.card.cardId, true)
    )

    function shadeColor(color, percent) {
        var R = parseInt(color.substring(1,3),16);
        var G = parseInt(color.substring(3,5),16);
        var B = parseInt(color.substring(5,7),16);

        // R = parseInt(R * (100 + percent) / 100);
        // G = parseInt(G * (100 + percent) / 100);
        // B = parseInt(B * (100 + percent) / 100);

        const COLOR_MAX = 180
        R = (R<COLOR_MAX)?R:COLOR_MAX;  
        G = (G<COLOR_MAX)?G:COLOR_MAX;  
        B = (B<COLOR_MAX)?B:COLOR_MAX;

        const COLOR_MIN = 50
        R = (R>COLOR_MIN)?R:COLOR_MIN;  
        G = (G>COLOR_MIN)?G:COLOR_MIN;  
        B = (B>COLOR_MIN)?B:COLOR_MIN;

        if (Math.abs(G-R)<60) G+=60
        if (Math.abs(G-B)<60) G-=60
        if (Math.abs(B-G)<60) B+=60
        if (Math.abs(B-R)<60) B-=60
        if (Math.abs(R-B)<60) R+=60
        if (Math.abs(R-G)<60) R-=60

        R = (R<COLOR_MAX)?R:COLOR_MAX;  
        G = (G<COLOR_MAX)?G:COLOR_MAX;  
        B = (B<COLOR_MAX)?B:COLOR_MAX;

        R = (R>COLOR_MIN)?R:COLOR_MIN;  
        G = (G>COLOR_MIN)?G:COLOR_MIN;  
        B = (B>COLOR_MIN)?B:COLOR_MIN;

        R = Math.round(R)
        G = Math.round(G)
        B = Math.round(B)

        var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
        var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
        var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

        return "#"+RR+GG+BB;
    }

    function getParent(id) {
        for (let list of props.allLists) {
            for (let card of props.allCards[list.id]) {
                if (card.id == id) {
                    if (card.cardId) return getParent(card.cardId)
                    return card
                }
            }
        }
    }

    function getColor(string) {
        if (colorAllSame.value) {
            let child
            for (let list of props.allLists) {
                for (let card of props.allCards[list.id]) {
                    if (card.id == string) child = card
                }
            }
            if (child.cardId == null) return shadeColor("#" + string.slice(0, 6))
            let parent = getParent(child.cardId)
            return shadeColor("#" + parent.id.slice(0, 6))
        }

        return shadeColor("#" + string.slice(0, 6))
    }

    let colorAllSame = useLocalStorage("colorAllSame", false)
</script>

<template>
    <div @contextmenu.prevent.stop="openMenu" draggable="true" @dragstart.stop="$emit('dragStart', props.card)" v-if="(notHiddenByMasterCard && (notHiddenByBoard || props.card.cardId == undefined)) || forceShowAll">
        <div 
            @dragenter.prevent="dropSpotVisible = true"
            @dragover.prevent="dropSpotVisible = true" 
            @dragleave="dropSpotVisible = false"
            @drop="e=>{$emit('drop', index); dropSpotVisible = false}" 
            :class="{cardDropSpot: dropSpotVisible && props.showDropSpot, cardDropSpotSmall: true}">
        </div>
        <div 
            :class="{
                container: true, 
                // assigningTo: props.assigningTo ? props.assigningTo.cardId == props.card.id : false,
                // isAssigned: props.assigningTo != undefined ? props.assigningTo.id == props.card.cardId : false,
                assigned: props.card.cardId != undefined,
                hasAssigned: props.card.subcards != 0
            }"
            :style="{
                'border-color': props.card.cardId != undefined ? getColor(props.card.cardId) : '#000000',
                '--id-color': getColor(props.card.id)
            }"
            @click="cardClick"
            @mouseenter="$emit('hover')"
            @mouseleave="$emit('hoverEnd')"
        >
            <div class="firstLine">
                <p class="title">{{ props.card.title }}</p>
                <p 
                    class="subcardCount" 
                    :class="{subcardCount: true, progress: true, complete: card.subcardCount == card.subcardsDone}"
                    v-if="props.card.subcardCount > 0"
                >{{ card.subcardsDone }}/{{ card.subcardCount }}</p>
            </div>
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
            <p class="boardName">{{ props.boardName }}</p>
        </div>
        <CardMenu :labels="props.labels" :assigned-labels="props.assignedLabels" :card="card" v-if="cardMenuVisible" @close="cardMenuVisible = false" :ws="props.ws"/>
        <ContextMenu :actions="actions" @action-clicked="ctxMenuClicked" :x="left" :y="top" v-if="menuVisible" v-click-away="() => menuVisible = false"/>
        <DecisionMenu v-if="deleteMenuVisible" @confirm="deleteCard" @cancel="deleteMenuVisible = false" optionOk="Confirm" text="Delete card?" optionCancel="Cancel"/>
    </div>
</template>

<style scoped>
    .assigned {
        border-width: 5px;
        border-style: solid;
    }
    .boardName {
        font-size: 1rem;
        margin-left: 10px;
    }
    .subcardCount {
        margin: auto;
        margin-right: 10px;
        font-size: 1.2rem;
    }
    .firstLine {
        display: flex;
        flex-direction: row;
    }
    .progress {
        display: inline-block;
        padding: 0 .25rem;
        margin-top: 5px;
        text-align: center;
        width: 3rem;
        background-color: var(--color-card-small-checklist-background);
        border-radius: 10px;
    }
    .complete {
        background-color: var(--color-card-small-checklist-complete);
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
    .assigningTo {
        background-color: var(--color-card-assinging-to);
    }
    .isAssigned {
        background-color: var(--color-card-is-subcard);
    }
    .hasAssigned {
        background-color: var(--id-color);
        text-shadow: black 1px 1px;
    }
</style>