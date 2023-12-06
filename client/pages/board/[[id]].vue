<script setup lang="ts">
import { mergeProps } from 'vue';
import BoardTitleBar from '~/components/BoardTitleBar.vue';

    const route = useRoute()

    interface List {
        id: string,
        title: string,
        position: number,
        boardId: string
    }

    let board = ref({
        id: route.params.id as string,
        title: "", 
        description: ""
    })
    let lists: Ref<List[]> = ref([])

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
                if (data.delete) {
                    lists.value = lists.value.filter(list => list.id != data.id)
                    break
                }

                let found = false
                for (let list of lists.value) {
                    if (list.id == data.id) {
                        list.title = data.title
                        list.boardId = data.boardId
                        list.position = data.position
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
                lists.value = lists.value.sort((a, b) => a.position < b.position ? -1 : 1)
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

    let dragging = ref(false)
    let draggingList: List | undefined = undefined
    function startDrag(list: List) {
        draggingList = list
        dragging.value = false
        dragging.value = true
    }
    
    function drop(index: number) {
        if (draggingList?.position < index) index -= 1
        if (index < 0) index = 0
        dragging.value = false
        ws.send(JSON.stringify({
            "action": "updateList",
            "id": draggingList?.id,
            "boardId": board.value.id,
            "position": index
        }))

        for (let list of lists.value) {
            if (list.id == draggingList?.id) continue
            if (list.position < draggingList?.position && list.position >= index) {
                ws.send(JSON.stringify({
                    "action": "updateList",
                    "boardId": board.value.id,
                    "id": list.id,
                    "position": list.position += 1
                }))
            }
            if (list.position > draggingList?.position && list.position <= index) {
                ws.send(JSON.stringify({
                    "action": "updateList",
                    "boardId": board.value.id,
                    "id": list.id,
                    "position": list.position -= 1
                }))
            }
        }
    }
    function dragEnd() {
        dragging.value = false
    }

    let deleteMenuVisible = ref(false)
    let listToDelete: List | undefined = undefined
    function listCtxAction(action: string, list: List) {
        if (action == "moveLeft") {
            if (list.position == 0) return
            startDrag(list)
            drop(list.position-1)
        }
        if (action == "moveRight") {
            if (list.position == lists.value.length - 1) return
            startDrag(list)
            drop(list.position+2)
        }
        if (action == "delete") {
            listToDelete = list
            deleteMenuVisible.value = true
        }
    }

    function deleteList() {
        deleteMenuVisible.value = false
        ws.send(JSON.stringify({
            "action": "updateList",
            "boardId": board.value.id,
            "id": listToDelete.id,
            "delete": true
        }))
    }
</script>

<template>
    <div @dragend="dragEnd">
        <BoardTitleBar :board="board" :ws="ws"/>
        <div class="lists">
            <div v-for="(list, index) in lists">
                <div class="listAndDropSpot">
                    <div class="dragDropSpot" @drop="()=>drop(index)" @dragenter.prevent=""  @dragover.prevent="" v-if="dragging && (index - draggingList?.position > 1 || draggingList?.position - index > 0)"></div>
                    <List @ctxMenuAction="action=>listCtxAction(action, list)" :list="list" @dragstart="()=>startDrag(list)" draggable="true" :ws="ws" :boardId="board.id"/>
                </div>
            </div>
            <div class="dragDropSpot last" @drop="()=>drop(lists.length)" @dragenter.prevent=""  @dragover.prevent="" v-if="dragging && Math.abs(lists.length - 1 - draggingList?.position) > 0"></div>
            <div class="newList">
                <input type="text" v-model="newListName"/>
                <button @click="createNewList">Create new list</button>
            </div>
        </div>
        <DecisionMenu v-if="deleteMenuVisible" @confirm="deleteList" @cancel="deleteMenuVisible = false" optionOk="Confirm" text="Delete list?" optionCancel="Cancel"/>
    </div>
</template>

<style scoped>
    .last {
        margin-left: 1rem;
    }
    .listAndDropSpot {
        display: flex;
        margin-left: 1rem;
    }

    .dragDropSpot {
        margin-top: 10px;
        width: 2.5rem;
        background-color: var(--color-background);
        filter:contrast(60%);
        border-color: black;
        border-style: solid;
        border-radius: 10px;
        height: 2.5rem;
    }

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