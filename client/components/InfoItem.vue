<script setup>
    import markdownit from 'markdown-it'
    
    let props = defineProps(["item", "ws"])
    let emit = defineEmits(['edit', "delete"])

    const md = markdownit()
    const result = ref(md.render(props.item.content))
    
    function uploadedImage(event) {
        const file = event.target.files[0]
        let reader = new FileReader()
        reader.onload = handleFile
        reader.readAsDataURL(file)
    }

    function handleFile(event) {
        if (props.item.images == undefined) props.item.images = [] 
        props.item.images.push(event.target.result)
        props.ws.send(JSON.stringify({
            "action": "updateInfoItem",
            "id": props.item.id,
            "boardId": props.item.boardId,
            "images": JSON.stringify(props.item.images)
        }))
    }

    function image() {
        document.getElementById("fileUpload").click()
    }

    function deleteImg(index) {
        props.item.images.splice(index, 1)
        props.ws.send(JSON.stringify({
            "action": "updateInfoItem",
            "id": props.item.id,
            "boardId": props.item.boardId,
            "images": JSON.stringify(props.item.images)
        }))
    }

    watch(
        () => props.item.content,
        () => {
            if (props.item.empty) return
            result.value = md.render(props.item.content)
        }
    )
</script>

<template>
    <div class="item" v-if="!item.empty" @dblclick="$emit('edit')"> 
        <div class="container">
            <h1>{{ item.title }}</h1>
            <hr>
            <div v-html="result"></div>
            <div class="images">
                <div v-for="(image, index) in item.images" class="image">
                    <Image :data="image" @delete="()=>deleteImg(index)"/>
                </div>
            </div>
        </div>
        <div>
            <input id="fileUpload" type="file" hidden @change="uploadedImage">
            <div class="addImage" @click="image()"></div>
            <div class="editItem" @click="$emit('edit')"></div>
            <div class="delete" @click="$emit('delete')"></div>
        </div>
    </div>
</template>

<style scoped>
    .image {
        width: fit-content;
        height: fit-content;
        margin-top: 10px;
    }
    .images {
        width: 100%;
        height: fit-content;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }
    :deep(a) {
        color: var(--color-text-dark-3);
        text-decoration: underline;
    }
    :deep(a:hover) {
        color: var(--color-white-2)
    }
    .addImage {
        background-color: var(--color-white-4);
        mask: url(/image.svg) no-repeat center;
        padding: 1rem;
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