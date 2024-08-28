<script setup lang="ts">
import "@melloware/coloris/dist/coloris.css";
import Coloris from "@melloware/coloris";
import type { Label } from "~/types";
import { useConnection } from "@/stores";
const ws = useConnection();

Coloris.init();
Coloris({
  el: "#coloris",
  themeMode: "dark",
  alpha: false,
});

const props = defineProps<{
  label: Label;
}>();

let name = ref(props.label.title);
function save() {
  ws.updateLabel(
    props.label.id,
    name.value,
    props.label.textColor,
    props.label.color,
  );
}
</script>

<template>
  <div v-if="!label.empty" class="label">
    <form class="label" @change="save">
      <EditableText
        :center="true"
        :maxlength="20"
        :text="props.label.title"
        class="labelName"
        :style="{
          color: props.label.textColor,
          'background-color': props.label.color,
        }"
        @edit="
          (txt: string) => {
            name = txt;
            save();
          }
        "
      />
      <input
        v-model="props.label.color"
        type="text"
        data-coloris
        class="labelColor"
      />
      <input
        v-model="props.label.textColor"
        type="text"
        data-coloris
        class="labelColor"
      />
      <button class="deleteBtn" @click.prevent="ws.deleteLabel(props.label.id)">
        <img src="/trash-2.svg" />
      </button>
    </form>
  </div>
</template>

<style scoped>
.deleteBtn {
  margin-top: auto;
  margin-bottom: 0;
  margin-right: 10px;
  padding: 0.5rem;
  background-color: var(--color-cardmenu-checklist-delete-item);
  border-radius: 10px;
  border-style: none;
}
.labelName {
  padding: 0 0.5rem;
  text-align: center;
  height: 2rem;
  width: 10rem;
  margin: 10px;
  border-radius: 10px;
}
.labelColor {
  height: 2rem;
  width: 5vw;
  margin: 10px;
  padding-left: 10px;
}
.label {
  height: 2rem;
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
}
</style>
