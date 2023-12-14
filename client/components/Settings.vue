<script setup>
    let props = defineProps(["ws", "labels", "boardId", "labelHasOwnWs", "creationEnabled"])
    
    function newLabel() {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "new": true,
            "boardId": props.boardId
        }))
    }   

    watch(
        () => props.labels,
        () => console.log(props.labels)
    )

    let showSubCards = useLocalStorage("showSubCards", true)
    let forceShowAllCards = useLocalStorage("showAllCards", false)
    let colorAllSame = useLocalStorage("colorAllSame", false)
</script>

<template>
    <div class="settings">
        <div class="localSettings">
            <h1>Local Settings</h1>
            <hr>
            <div class="showSubCardsOption">
                <Switch class="option" :value="forceShowAllCards" @change="val=>forceShowAllCards = val"/>
                    <label class="showSubCardsText" for="showSubCardsCheckbox">Force show all cards</label>
            </div>
            <div class="showSubCardsOption">
                <Switch class="option" :value="showSubCards" @change="val=>showSubCards = val"/>
                <label class="showSubCardsText" for="showSubCardsCheckbox">Show Subcards</label>
            </div>
            <div class="showSubCardsOption">
                <Switch class="option" :value="colorAllSame" @change="val=>colorAllSame = val"/>
                <label class="showSubCardsText" for="showSubCardsCheckbox">Color all subcards like 1st parent</label>
            </div>
        </div>
        <h1 class="header">Labels</h1>
        <hr>
        <div class="labels">
            <div v-for="label in props.labels" :key="label.id">
                <LabelSetting :label="label" :ws="props.labelHasOwnWs ? label.ws : props.ws"/>
            </div>
            <div v-if="creationEnabled" class="newLabelItem" @click="newLabel">
                <div></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    label {
        width: 70%;
    }
    .header {
        margin-top: 3rem;
    }
    hr {
        margin-bottom: 10px;
    }
    .newLabelItem {
        height: 2.5rem;
        border-style: dotted;
        border-radius: 10px;
        width: 10rem;
        margin-left: 10px;
        margin-top:10px;
        background-color: var(--color-boardmenu-newitem-background);
        border-color: var(--color-boardmenu-newitem-border);
        transition: .3s;
    }
    .newLabelItem:hover {
        background-color: var(--color-boardmenu-newitem-background-hover);
        border-color: var(--color-boardmenu-newitem-border-hover);
    }
    .newLabelItem > div {
        transition: .2s;
        padding: .9rem;
        margin-top: .25rem;
        background-color: var(--color-settings-newlabel-icon);
        mask: url(/plus-circle.svg) no-repeat center;
    }
    .newLabelItem:hover > div {
        background-color: var(--color-settings-newlabel-icon-hover);
    }
    .showSubCardsText {
        margin: auto 0;
        font-size: 1.25rem;
    }
    .option {
        margin: 3px 10px;
    }
    .showSubCardsOption {
        display:flex;
        flex-direction: row;
        text-align: left;
    }
    .labels { 
        display: flex;
        flex-direction: column;
    }
    h1 {
        color: var(--color-settings-header);
        margin-left: 10px;   
    }
    .settings {
        border-style:solid;
        border-width: 0;
        border-color: var(--color-black-4);
        border-top-width: 5px;
        scrollbar-width: thin;
        scrollbar-color: var(--color-list-scrollbar) var(--color-list-background);
        overflow-y: scroll;
        z-index: 7;
        position: fixed;
        right: 0;
        width: 80vw;
        height: 100vh;
        background-color: var(--color-settings-background);
        filter: drop-shadow(-10px 15px 15px black)
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