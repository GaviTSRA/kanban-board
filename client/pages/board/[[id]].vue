<script setup lang="ts">
import BoardTitleBar from '~/components/BoardTitleBar.vue';

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
        <BoardTitleBar :board="board"/>
    </div>
</template>

<style scoped>

</style>