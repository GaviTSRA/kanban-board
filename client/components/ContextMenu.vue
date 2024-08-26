<script setup lang="ts">
interface Action {
  name: string;
  action?: string;
  danger?: boolean;
  submenu?: Action[];
}

const props = defineProps<{
  actions: Action[];
  x?: number;
  y?: number;
}>();
const emit = defineEmits<{
  "action-clicked": [action: string];
}>();

let { actions, x, y } = props;

if (x == undefined) x = 0;
if (y == undefined) y = 0;

let showSubmenu: Ref<{ [name: string]: boolean }> = ref({});
let hoversOverSubmenu: Ref<{ [name: string]: boolean }> = ref({});

for (let action of actions) {
  showSubmenu.value[action.name] = false;
  hoversOverSubmenu.value[action.name] = false;
}

const emitAction = (action: string) => {
  emit("action-clicked", action);
};

function vw(percent: number) {
  var w = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0,
  );
  return (percent * w) / 100;
}

let submenuLeft = vw(40);
if (document.documentElement.clientWidth > 1025) {
  submenuLeft = vw(10);
}

function hideSubmenu(action: string) {
  setTimeout(() => {
    if (hoversOverSubmenu.value[action]) return;
    showSubmenu.value[action] = false;
  }, 100);
}

function hideMenuFromSub(action: string) {
  showSubmenu.value[action] = false;
  hoversOverSubmenu.value[action] = false;
}
</script>

<template>
  <div
    @contextmenu.prevent.stop=""
    class="rcMenu"
    :style="{ top: y + 'px', left: x + 'px', '--itemCount': actions?.length }"
  >
    <div v-for="action in actions">
      <button
        v-if="!action.submenu && action.action"
        :class="{
          item: true,
          danger: action.danger,
          nodanger: !action || !action.danger,
        }"
        @click="emitAction(action?.action)"
      >
        {{ action.name }}
      </button>
      <div
        v-if="action.submenu"
        :class="{
          item: true,
          subCard: true,
          danger: action.danger,
          nodanger: !action || !action.danger,
        }"
      >
        <p
          @mouseover="showSubmenu[action.name] = true"
          @mouseleave="() => hideSubmenu(action.name)"
        >
          {{ action.name }}
        </p>
        <ContextMenu
          class="subMenu"
          @mouseover="hoversOverSubmenu[action.name] = true"
          @mouseleave="() => hideMenuFromSub(action.name)"
          v-if="showSubmenu[action.name]"
          :actions="action.submenu"
          :x="submenuLeft"
          :y="0"
          @action-clicked="(action) => $emit('action-clicked', action)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.subMenu {
  position: relative;
}
.rcMenu {
  position: fixed;
  width: 15rem;
  height: calc(var(--itemCount) * 3rem);
  display: flex;
  flex-direction: column;
  background-color: var(--color-ctxmenu-background);
  border-style: none;
  border-radius: 10px;
  filter: drop-shadow(-4px 4px 5px black);
  z-index: 9999;
}

.rcMenu .item {
  font-size: 1rem;
  z-index: 9999;
  text-align: left;
  padding-left: 20px;
  background-color: var(--color-ctxmenu-background);
  border-style: none;
  border-width: 2px;
  width: 15rem;
  height: 3rem;
  border-radius: 10px;
}
.rcMenu .nodanger:hover {
  background-color: var(--color-ctxmenu-hover);
  border-color: var(--color-ctxmenu-background);
}

.rcMenu p {
  font-size: 1.25rem;
}

.nodanger {
  color: white;
}

.danger {
  color: var(--color-ctxmenu-danger-txt);
}

.danger:hover {
  background-color: var(--color-ctxmenu-danger-hover);
  border-color: var(--color-ctxmenu-danger-hover);
  color: black;
}
</style>
