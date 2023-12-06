<script setup lang="ts">
import BoardTitleBar from '~/components/BoardTitleBar.vue';

    const route = useRoute()

    let board = ref({
        id: route.params.id as string,
        title: "", 
        description: ""
    })
    let lists: Ref<{
        id: string,
        title: string,
        boardId: string
    }[]> = ref([])

    let ws = new WebSocket("ws://localhost:3001/board/"+route.params.id)

    ws.onclose = () => {
        window.location.href = "/"
    }

    ws.onmessage = msg => {
        const data = JSON.parse(msg.data)

        switch(data.type) {
            case "board":
                board.value.title = data.title
                board.value.description = data.description
                break

            case "list":
                let found = false
                for (let list of lists.value) {
                    if (list.id == data.id) {
                        list.title = data.title
                        list.boardId = data.boardId
                        found = true
                        break
                    }
                }
                if (found) break
                lists.value.push({
                    id: data.id,
                    title: data.title,
                    boardId: data.boardId
                })
                break
            
            case "card":
                break
        }
    }

    let newListName = ref("")
    function createNewList() {
        if (newListName.value == "") return

        ws.send(JSON.stringify({
            "action": "updateList",
            "new": true,
            "boardId": board.value.id,
            "title": newListName.value
        }))

        newListName.value = ""
    }
</script>

<template>
    <div>
        <BoardTitleBar :board="board"/>
        <div class="lists">
            <div v-for="list in lists">
                <div class="list">
                    <p>{{ list.title }}</p>
                </div>
            </div>
            <div class="newList">
                <input type="text" v-model="newListName"/>
                <button @click="createNewList">Create new list</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .list {
        margin-left: 1rem;
        margin-top: 10px;
        background-color: var(--color-background-mute);
        width: 10vw;
        max-width: 10vw;
        text-align: center;
        font-size: 1.5rem;
        border-radius: 10px;
    }
    .lists {
        overflow: auto;
        display: flex;
        flex-direction: row;
        width: 100vw;
        height: 93vh;
    }

    .newList {
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        margin-left: 1rem;
    }
</style>