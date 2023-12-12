<script setup>
    let props = defineProps(["ws", "labels", "boardId"])
    
    function newLabel() {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "new": true,
            "boardId": props.boardId
        }))
    }    
    let showSubCards = useLocalStorage("showSubCards", true)
    let forceShowAllCards = useLocalStorage("showAllCards", false)
</script>

<template>
    <div class="settings">
        <div class="showSubCardsOption">
            <input id="showSubCardsCheckbox" type="checkbox" v-model="forceShowAllCards"/>
            <label class="showSubCardsText" for="showSubCardsCheckbox">Force show all cards</label>
        </div>
        <div class="showSubCardsOption">
            <input id="showSubCardsCheckbox" type="checkbox" v-model="showSubCards"/>
            <label class="showSubCardsText" for="showSubCardsCheckbox">Show Subcards</label>
        </div>
        <h1>Labels</h1>
        <div class="labels">
            <div v-for="label in props.labels">
                <LabelSetting :label="label" :ws="props.ws" :boardId="props.boardId"/>
            </div>
            <button @click="newLabel" class="newLabel">New Label</button>
        </div>
    </div>
</template>

<style scoped>
    .showSubCardsText {
        margin: auto 0;
        font-size: 1.25rem;
    }
    #showSubCardsCheckbox {
        margin: 10px 20px;
        transform: scale(2);
    }
    .showSubCardsOption {
        display:flex;
        flex-direction: row;
        text-align: left;
    }
    .newLabel {
        background-color: var(--color-settings-labels-new);
        border-style: none;
        border-radius: 10px;
        padding: .5rem 1rem;;
        height: fit-content;
        margin: 30px auto;
    }
    .newLabel:hover {
        background-color: var(--color-settings-labels-new-hover);
    }
    .labels { 
        display: flex;
        flex-direction: column;
    }
    h1 {
        margin-top: 2rem;
        color: var(--color-settings-header);
        margin-left: 10px;   
    }
    .settings {
        z-index: 7;
        position: fixed;
        right: 0;
        width: 80vw;
        height: 100vh;
        background-color: var(--color-settings-background);
        filter: drop-shadow(-10px 15px 15px black)
    }

    :deep(.editable) {
        width: 20vw;
    }

    @media (min-width: 1025px) {
        .settings {
            width: 25vw;
        }

        :deep(.editable) {
            width: 5vw;
        }
    }
</style>