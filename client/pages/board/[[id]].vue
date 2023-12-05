<script setup lang="ts">
    const route = useRoute()

    let board = ref({
        id: route.params.id as string,
        title: "", 
        description: ""
    })

    let ws = new WebSocket("ws://localhost:3001/board/"+route.params.id)

    ws.onclose = () => {
        window.location.href = "/"
    }

    ws.onmessage = msg => {
        const data = JSON.parse(msg.data)

        switch(data["type"]) {
            case "board":
                board.value.title = data.title
                board.value.description = data.description

            case "list":
                break
            
            case "card":
                break
        }
    }
</script>

<template>
    <div>
        <div class="header">
            <p class="title">{{ board.title }}</p>
            <p class="description">{{ board.description }}</p>
        </div>
    </div>
</template>

<style scoped>
    .header {
        display: flex;
        flex-direction: row;
        position: absolute;
        top: 0;
        width: 100vw;
        height: 7vh;
        background-color: var(--color-background-mute);
    }

    .title {
        font-size: 1.5rem;
        margin: 10px;
        color: aqua
    }

    .description {
        margin: auto 0;
        margin-left: 1rem;
        width: 30vw;
    }
</style>