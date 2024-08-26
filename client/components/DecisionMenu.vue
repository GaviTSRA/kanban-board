<script setup lang="ts">
const props = defineProps<{
  text: string;
  optionOk: string;
  optionCancel: string;
}>();
const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();

let canCancel = false;
setTimeout(() => {
  canCancel = true;
}, 1);

function cancel() {
  if (canCancel) emit("cancel");
}
</script>

<template>
  <div v-click-away="cancel" class="deleteMenu">
    <p>{{ props["text"] }}</p>
    <div>
      <button class="btnOk" @click="$emit('confirm')">
        {{ props["optionOk"] }}
      </button>
      <button class="btnCancel" @click="$emit('cancel')">
        {{ props["optionCancel"] }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.deleteMenu {
  position: absolute;
  width: 40vw;
  left: 30vw;
  height: 15rem;
  top: 40vh;
  box-shadow: -10px 10px 10px black;
  background-color: var(--color-decisionmenu-background);
  border-color: var(--color-decisionmenu-border);
  border-style: solid;
  border-width: 5px;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  text-align: center;
  z-index: 99999;
}
p {
  margin-top: 10px;
  font-size: 2rem;
}
button {
  margin-top: 50px;
  font-size: 1rem;
  border-style: none;
  padding: 0.5rem 1rem;
  margin-left: 10px;
  margin-right: 10px;
  border-radius: 5px;
}
.btnOk {
  background-color: var(--color-decisionmenu-btn-ok);
}
.btnOk:hover {
  background-color: var(--color-decisionmenu-btn-ok-hover);
}
.btnCancel {
  background-color: var(--color-decisionmenu-btn-cancel);
}
.btnCancel:hover {
  background-color: var(--color-decisionmenu-btn-cancel-hover);
}

@media (min-width: 1225px) {
  .deleteMenu {
    left: 40vw;
    width: 20vw;
  }
}

@media (max-width: 550px) {
  .deleteMenu {
    width: 100vw;
    left: 0;
  }
}
</style>
