<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text: string;
    maxlength: number;

    center?: boolean;
    editable?: boolean;
    focus?: boolean;
    textarea?: boolean;
  }>(),
  {
    center: false,
    editable: true,
    focus: false,
    textarea: false,
  },
);
const emit = defineEmits<{
  edit: [value: string];
}>();

let textValue = ref("");
let editing = ref(false);

let input: Ref<undefined | HTMLInputElement> = ref(undefined);
let textareaRef: Ref<undefined | HTMLInputElement> = ref(undefined);

let timer: NodeJS.Timeout | undefined;
let x: number;
let y: number;
async function detectDoubleClick(event: { x: number; y: number }) {
  if (props.editable != undefined && !props.editable) return;
  if (timer && Math.abs(x - event.x) < 10 && Math.abs(y - event.y) < 10) {
    textValue.value = props.text;
    x = 0;
    y = 0;
    clearTimeout(timer);
    editing.value = true;
    await nextTick();
    input.value?.focus();
    textareaRef.value?.focus();
  } else {
    timer = setTimeout(() => {
      x = 0;
      y = 0;
    }, 500);
    x = event.x;
    y = event.y;
  }
}

let isFocused = ref(false);
function done(isTextArea: boolean) {
  if (isTextArea && !props.textarea) return;
  if (!isTextArea && props.textarea) return;
  if (!isFocused.value) return;
  editing.value = false;
  emit("edit", textValue.value);
}

onBeforeUpdate(async () => {
  await getFocus();
});

function looseFocus() {
  setTimeout(() => {
    if (editing.value) done(props.textarea);
    isFocused.value = false;
  }, 100);
}

async function getFocus() {
  if (props.focus && !editing.value && props.text == "") {
    textValue.value = props.text;
    editing.value = true;

    await nextTick();

    if (input.value) {
      input.value.focus();
    }
    if (textareaRef.value) textareaRef.value.focus();
  }
}

onMounted(async () => {
  await getFocus();
});
</script>

<template>
  <form
    :class="{ container: true, center: props.center }"
    @submit.prevent="() => done(false)"
  >
    <p v-if="!editing" class="editable" @click="detectDoubleClick">
      {{ props.text }}
    </p>
    <input
      v-show="editing && !props.textarea"
      ref="input"
      v-model="textValue"
      v-all-click-away="() => done(false)"
      :maxlength="maxlength"
      class="editable"
      @focus="isFocused = true"
      @blur="looseFocus"
    />
    <textarea
      v-show="editing && props.textarea"
      ref="textareaRef"
      v-model="textValue"
      v-all-click-away="() => done(true)"
      :maxlength="maxlength"
      class="editable"
      @focus="isFocused = true"
      @blur="looseFocus"
    />
  </form>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
}
.center {
  justify-content: center;
}
p {
  min-width: 1rem;
  min-height: 1rem;
}
</style>
