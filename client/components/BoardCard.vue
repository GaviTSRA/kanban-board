<script setup lang="ts">
    let props = defineProps(["board"])
    
    let title: string = props.board["title"]
    if (title.length > 30) {
        let newTitle: string = ""
        let parts = title.split(" ")
        for (const part of parts) {
            if (newTitle.length + part.length < 30) newTitle += " " + part
        }
        if (newTitle == "") newTitle = title.substring(0, 30)
        title = newTitle + "..."
    }

    let description = props.board["description"]
    if (description.length > 140) {
        let newDescription: string = ""
        let parts = description.split(" ")
        for (const part of parts) {
            if (newDescription.length + part.length < 140) newDescription += " " + part
        }
        if (newDescription == "") newDescription = description.substring(0, 130)
        description = newDescription + "..."
    }

    let menuVisible = ref(false)
    let top = ref(0)
    let left = ref(0)
    let menu = ref(null)
    let deleteMenuVisible = ref(false)

    async function openMenu(event: Event) {
        top.value = event.y
        left.value = event.x
        
        menuVisible.value = true
        await nextTick()
        menu.value?.focus()
    }

    async function deleteBoard(boardID: string) {
        deleteMenuVisible.value = false
        await useFetch("http://localhost:3001", {
            method: "DELETE",
            body: JSON.stringify({
                id: props.board["id"]
            })
        })
        window.location.reload()
    }

    function ctxMenuClicked(action: string) {
        menuVisible.value = false
        if (action == "deleteBoard") {
            deleteMenuVisible.value = true
        }
    }

    let actions = [
        {
            name: "Delete Board",
            action: "deleteBoard",
            danger: true
        }
    ]

    let touchTimer
    function touchStart(e) {
        touchTimer = setTimeout(() => openMenu(e), 500); 
    }

    function touchEnd() {
        if (touchTimer)
            clearTimeout(touchTimer)
    }
</script>

<template>
    <div class="boardCard">
        <NuxtLink class="link" :to="'/board/'+props.board['id']" @contextmenu.prevent="(e) => openMenu(e)" @touchstart="touchStart" @touchend="touchEnd">
            <div class="container">
                <h2>{{ title }}</h2>
                <hr>
                <p>{{ description }}</p>
                <div class="stats">
                    <p><span>{{ board.lists }}</span> Lists</p>
                    <p><span>{{ board.cards }}</span> Cards</p>
                    <p><span>{{ board.done }}</span>/<span>{{ board.tasks }}</span> Tasks done</p>
                </div>
            </div>
        </NuxtLink>
        <ContextMenu :actions="actions" @action-clicked="ctxMenuClicked" :x="left" :y="top" v-if="menuVisible" v-all-click-away="() => menuVisible = false"/>
        <DecisionMenu v-if="deleteMenuVisible" @confirm="deleteBoard" @cancel="deleteMenuVisible = false" optionOk="Confirm" text="Delete board?" optionCancel="Cancel"/>
    </div>
</template> 

<style scoped>
    .stats {
        width: 50%;
        line-height: 3px;
        margin-top: auto;
        margin-bottom: 1rem;
        margin-left: 20px;
        margin-right: auto;
    }
    .stats > p {
        color: var(--color-text-dark-3);
    }
    .stats > p > span {
        color: var(--color-text-dark-2)
    }

    hr {
        width: 100%;
    }
    .link {
        margin-top: 1rem;
        border-radius: 10px;
        height: 100%;
        width: 100%;
    }
    .link:hover {
        transform: translate(10px, -5px);
    }
    .boardCard {
        margin-bottom: 10px;
        height: 100%;
        width: 100%;
    }
    .container {
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        background-color: var(--color-boardcard-background);
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: left;
        text-align: center;
        transition: .5s;
    }
    .container:hover {
        background-color: var(--color-boardcard-hover);
        filter: drop-shadow(-10px 5px 10px var(--color-boardcard-dropshadow));
    }

    h2 {
        color: var(--color-boardcard-header);
        width: 95%;
        font-size: 1.8rem;
    }
    p {
        margin-top: 1rem;
        color: var(--color-boardcard-text);
        width: 90%;
        font-size: 1rem;
        overflow-wrap: break-word;
        text-align: left;
    }

    @media (min-width: 1025px) { 

    }
</style>