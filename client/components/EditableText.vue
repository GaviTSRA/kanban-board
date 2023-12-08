<script setup>
    let props = defineProps(["text", "textarea", "focus"])
    let emit = defineEmits(["edit"])

    let text = ref("")
    let editing = ref(false)

    let input = ref(null)
    let textarea = ref(null)

    let timer
    let x
    let y
    function detectDoubleClick(event) {
        if (timer && Math.abs(x - event.x) < 10 && Math.abs(y - event.y) < 10) {
            text.value = props.text
            x = 0
            y = 0
            clearTimeout(timer)
            editing.value = true
        } else {
            timer = setTimeout(() => {
                x = 0
                y = 0
            }, 500)
            x = event.x
            y = event.y
        }
    }

    function done() {
        editing.value = false
        emit("edit", text.value)
    }

    onBeforeUpdate(async () => {
        await focus()
    })

    async function focus() {
        if (props.focus && !editing.value && props.text == "") {
            text.value = props.text
            editing.value = true
            
            await nextTick()
            
            if (input.value) {
                input.value.focus()
            }
            if (textarea.value)
                textarea.value.focus()
        } 
    }
</script>

<template>
    <form @submit.prevent="done" class="container">
        <p @click="detectDoubleClick" v-if="!editing">{{ props.text }}</p>
        <input ref="input" class="editable" v-model="text" v-show="editing && !props.textarea"/>
        <textarea ref="textarea" class="editable" v-model="text" v-show="editing && props.textarea"/>
    </form>
</template>

<style scoped>
    p {
        min-width: 1rem;
        min-height: 1rem;
    }
</style>