<script setup lang="ts">
    let showSubCards = useLocalStorage("showSubCards", true)
    let forceShowAllCards = useLocalStorage("showAllCards", false)
    let colorAllSame = useLocalStorage("colorAllSame", false)

    let themes = {
        "dark": "#111111", 
        "light": "#EEEEEE"
    }

    let currentTheme = useLocalStorage("theme", "dark")

    function updateTheme(theme: string) {
        currentTheme.value = theme
        window.location.reload()
    }
</script>

<template>
     <div class="settings">
        <div class="localSettings">
            <h1>Local Settings</h1>
            <hr>
            <div class="showSubCardsOption">
                <Switch class="option" :value="forceShowAllCards" @change="(val: boolean)=>forceShowAllCards = val"/>
                    <label class="showSubCardsText" for="showSubCardsCheckbox">Force show all cards</label>
            </div>
            <div class="showSubCardsOption">
                <Switch class="option" :value="showSubCards" @change="(val: boolean)=>showSubCards = val"/>
                <label class="showSubCardsText" for="showSubCardsCheckbox">Show Subcards</label>
            </div>
            <div class="showSubCardsOption">
                <Switch class="option" :value="colorAllSame" @change="(val: boolean)=>colorAllSame = val"/>
                <label class="showSubCardsText" for="showSubCardsCheckbox">Color all subcards like 1st parent</label>
            </div>
        </div>
        <div class="themes">
            <h1>Themes</h1>
            <hr>
            <div class="allThemes">
                <div v-for="(color, theme) in themes">
                    <div class="theme" :style="{'--color': color}" @click="updateTheme(theme)"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .theme {
        background-color: var(--color);
        padding: 2.5rem;
        width: 1rem;
        margin: 10px;
        filter: drop-shadow(0px 0px 5px var(--color));
        border-radius: 10px;
    }
    .allThemes {
        display: flex;
        flex-direction: row
    }
    .themes {
        margin-top: 3rem;
    }
    label {
        width: 70%;
    }
    hr {
        margin-bottom: 10px;
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
        height: 93vh;
        margin-top: 7vh;
        background-color: var(--color-settings-background);
        filter: drop-shadow(-10px 15px 15px var(--color-shadow))
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