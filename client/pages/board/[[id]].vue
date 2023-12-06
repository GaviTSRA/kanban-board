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
        position: number,
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
                if (!found) {
                    lists.value.push({
                        id: data.id,
                        title: data.title,
                        position: data.position,
                        boardId: data.boardId
                    })
                }
                lists.value.sort((a, b) => a.position < b.position ? -1 : 1)
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
            "position": lists.value.length,
            "boardId": board.value.id,
            "title": newListName.value
        }))

        newListName.value = ""
    }
</script>

<template>
    <div>
        <BoardTitleBar :board="board" :ws="ws"/>
        <div class="lists">
            <div v-for="list in lists">
                <List :list="list" />
            </div>
            <div class="newList">
                <input type="text" v-model="newListName"/>
                <button @click="createNewList">Create new list</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .lists {
        overflow: auto;
        display: flex;
        flex-direction: row;
        width: 100vw;
        height: 93vh;
    }

    .newList {
        background-color: var(--color-background-mute);
        width: 10vw;
        height: fit-content;
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        margin-left: 1rem;
        align-items: center;
        border-radius: 10px;
    }

    .newList input {
        width: 75%;
        margin-top: 10px;
        height: 2rem;
    }

    .newList button {
        margin: 10px 0;
        background-color: var(--color-btn-create);
        border-style: none;
        border-radius: 10px;
        padding: .5rem 1rem;
    }

    .newList button:hover {
        background-color: var(--color-btn-create-hover);
    }
</style>