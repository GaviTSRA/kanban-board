<script setup lang="ts">
const props = defineProps<{
  value: boolean;
}>();
const emit = defineEmits<{
  change: [value: boolean];
}>();

function toggleCheckbox() {
  emit("change", !props.value);
}
</script>

<template>
  <label class="switch">
    <input type="checkbox" @click="toggleCheckbox" :checked="props.value" />
    <div class="slider round"></div>
  </label>
</template>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-black-4);
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 30px;
  width: 30px;
  left: 4px;
  bottom: 2px;
  background-color: var(--color-black-1);
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: var(--color-black-5);
}

input:checked + .slider:before {
  background-color: var(--color-btn-create);
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
