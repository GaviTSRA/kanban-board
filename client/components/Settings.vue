<script setup>
    let props = defineProps(["ws", "labels", "boardId"])
    
    function newLabel() {
        props.ws.send(JSON.stringify({
            "action": "updateLabel",
            "new": true,
            "boardId": props.boardId
        }))
    }    
</script>

<template>
    <div class="settings">
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
    .newLabel {
        background-color: var(--color-btn-create);
        border-style: none;
        border-radius: 10px;
        padding: .5rem 1rem;;
        height: fit-content;
        margin: 30px auto;
    }
    .newLabel:hover {
        background-color: var(--color-btn-create-hover);
    }
    .labels { 
        display: flex;
        flex-direction: column;
    }
    h1 {
        color: aqua;
        margin-left: 10px;   
    }
    .settings {
        z-index: 7;
        position: fixed;
        right: 0;
        width: 80vw;
        height: 100vh;
        background-color: var(--color-background-soft);
        filter: drop-shadow(-10px 15px 15px black)
    }

    :deep(input) {
        width: 20vw;
    }

    @media (min-width: 1025px) {
        .settings {
            width: 25vw;
        }

        :deep(input) {
            width: 5vw;
        }
    }
</style>