<script setup lang="ts">
    const route = useRoute();
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
    let deleteButton = ref(null)

    async function openMenu(event: Event) {
        top.value = event.y
        left.value = event.x
        
        menuVisible.value = true
        await nextTick()
        menu.value?.focus()
        
        /*
        let largestHeight = window.innerHeight - menu.value?.offsetHeight - 25
        let largestWidth = window.innerWidth - menu.value?.offsetWidth - 25

        if (top.value > largestHeight) top.value = largestHeight
        if (left.value > largestWidth) left.value = largestWidth
        */
    }

    async function deleteBoard(boardID: string) {
        deleteMenuVisible.value = false
        await useFetch("http://localhost:3001", {
            method: "DELETE",
            body: JSON.stringify({
                id: props.board["id"]
            })
        })
        // TODO refresh without reloading page
        window.location.reload()
    }

    function ctxMenuClicked(action: string) {
        menuVisible.value = false
        if (action == "deleteBoard") {
            deleteMenuVisible.value = true
        }
    }

    function hideMenu() {
        menuVisible.value = false
    }

    let actions = [
        ["Delete Board", "deleteBoard"]
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
    <NuxtLink :to="'/board/'+props.board['id']" @contextmenu.prevent="(e) => openMenu(e)" @touchstart="touchStart" @touchend="touchEnd">
        <div class="container">
            <h2>{{ title }}</h2>
            <p>{{ description }}</p>
        </div>
    </NuxtLink>
    <ContextMenu :actions="actions" @action-clicked="ctxMenuClicked" :x="left" :y="top" v-if="menuVisible" v-click-away="hideMenu"/>
    <DecisionMenu v-if="deleteMenuVisible" @confirm="deleteBoard" @cancel="deleteMenuVisible = false" optionOk="Confirm" text="Delete board?" optionCancel="Cancel"/>
</template> 

<style scoped>
    .container {
        display: flex;
        flex-direction: row;
        border-radius: 10px;
        background-color: rgb(42, 42, 42);
        width: 90vw;
        height: 10vh;
        max-height: 10vh;
        padding: 2.5rem 1rem;
        margin-bottom: 20px;
        align-items: center;
        justify-content: left;
        text-align: left;
    }
    .container:hover {
        background-color: var(--vt-c-indigo);
        transform: translate(10px, -5px);
        filter: drop-shadow(-10px 5px 10px var(--vt-c-black-mute));
    }

    h2 {
        color: aqua;
        width: 30%;
        font-size: 0.75rem;
    }
    p {
        color: gray;
        margin-left: 1rem;
        width: 70%;
        font-size: .75rem;
    }

    @media (min-width: 1025px) { 
        .container {
            width: 50vw;
            padding: 3.5rem 2rem;
        }
        h2 {
            font-size: 2rem;
        }
        p {
            width: 50%;
            font-size: 1rem;
        }
    }
</style>