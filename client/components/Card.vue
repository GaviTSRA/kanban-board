<script setup>
    let props = defineProps(["card", "ws", "showDropSpot"])
    let emit = defineEmits(["dragStart", "drop"])

    function getDescription() {
        let description = props.card.description
        if (description.length > 110) {
            let newDescription = ""
            let parts = description.split(" ")
            for (const part of parts) {
                if (newDescription.length + part.length < 110) newDescription += " " + part
            }
            if (newDescription == "") newDescription = description.substring(0, 110)
            description = newDescription + "..."
        }
        return description
    }

    let cardMenuVisible = ref(false)

    let dropSpotVisible = ref(false)
</script>

<template>
    <div  @contextmenu.stop="" draggable="true" @dragstart.stop="$emit('dragStart', props.card)">
        <div 
            @dragenter.prevent="dropSpotVisible = true"
            @dragover.prevent="dropSpotVisible = true" 
            @dragleave="dropSpotVisible = false"
            @drop="e=>{$emit('drop', index); dropSpotVisible = false}" 
            :class="{cardDropSpot: dropSpotVisible, cardDropSpotSmall: true}">
        </div>
        <div class="container" @click="() => cardMenuVisible = true">
            <p class="title">{{ props.card.title }}</p>
            <p v-if="props.card.description != undefined" class="description">{{ getDescription() }}</p>
        </div>
        <CardMenu :card="card" v-if="cardMenuVisible" @close="cardMenuVisible = false" :ws="props.ws"/>
    </div>
</template>

<style scoped>
    .cardDropSpotSmall {
        width: 100%;
        height: 15px;
    }
    .cardDropSpot {
        height: 4rem;
    }
    .container {
        background-color: var(--color-card-primary);
        border-radius: 10px;
        margin: 0 10px;
        text-align: left;
    }
    .title {
        margin-left: 10px;
        color: var(--color-card-title);
    }
    .description {
        color: var(--color-card-description);
        font-size: 1rem;
        line-height: 15px;
        padding: 10px;
    }
</style>