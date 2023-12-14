<script setup>
    import markdownit from 'markdown-it'
    
    let props = defineProps(["item"])
    let emit = defineEmits(['edit', "delete"])

    const md = markdownit()
    const result = ref(md.render(props.item.content))

    watch(
        () => props.item.content,
        () => {
            if (props.item.empty) return
            result.value = md.render(props.item.content)
        }
    )
</script>

<template>
    <div class="item" v-if="!item.empty"> 
        <div class="container">
            <h1>{{ item.title }}</h1>
            <hr>
            <div v-html="result"></div>
        </div>
        <div>
            <div class="editItem" @click="$emit('edit')"></div>
            <div class="delete" @click="$emit('delete')"></div>
        </div>
    </div>
</template>

<style scoped>
    :deep(a) {
        color: var(--color-text-dark-3);
        text-decoration: underline;
    }
    :deep(a:hover) {
        color: var(--color-white-2)
    }
    .editItem {
        background-color: var(--color-white-4);
        mask: url(/edit.svg) no-repeat center;
        padding: 1rem;
    }
    .delete {
        background-color: var(--color-white-4);
        mask: url(/trash-2.svg) no-repeat center;
        padding: 1rem;
    }
    .item {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
    }
    .container {
        background-color: var(--color-black-1);
        width: 80%;
        padding: 1rem 2rem;
        margin-top: 1rem;
        margin-left: 1rem;
        border-radius: 10px;
    }
</style>