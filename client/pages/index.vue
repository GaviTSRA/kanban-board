<script setup lang="ts">
  const route = useRoute()
  const {data} = await useFetch('http://localhost:3001')
  const boards = JSON.parse(data.value) 
</script>

<template>
  <div v-for="board in boards">
    <BoardCard :board="board"/>
  </div>
</template>
