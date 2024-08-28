<script setup lang="ts">
import { useConnection } from "@/stores";
import type { Card, InfoItem, Label, List } from "~/types";
const conn = useConnection();

const route = useRoute();

let board = ref({
  id: route.params.id as string,
  title: "",
  description: "",
});
let lists: Ref<List[]> = ref([]);
let cards: Ref<{ [listId: string]: Card[] }> = ref({});
let labels: Ref<Label[]> = ref([]);
let assignedLabels: Ref<{ [labelId: string]: string }[]> = ref([]);
let infoItems: Ref<InfoItem[]> = ref([]);

let ws = new WebSocket("ws://localhost:3001/board/" + route.params.id);
conn.init(ws);

ws.onclose = () => {
  window.location.href = "/";
};

ws.onmessage = async (msg) => {
  const data = JSON.parse(msg.data);

  let found;
  switch (data.type) {
    case "board":
      board.value.title = data.title;
      board.value.description = data.description;
      break;

    case "list":
      if (data.delete) {
        lists.value = lists.value.filter((list) => list.id != data.id);
        break;
      }

      found = false;
      for (let list of lists.value) {
        if (list.id == data.id) {
          list.title = data.title;
          list.boardId = data.boardId;
          list.position = data.position;
          found = true;
          break;
        }
      }
      if (!found) {
        if (!cards.value[data.id]) {
          cards.value[data.id] = [];
        }
        lists.value.push({
          id: data.id,
          title: data.title,
          position: data.position,
          boardId: data.boardId,
        });
      }
      lists.value = lists.value.sort((a, b) =>
        a.position < b.position ? -1 : 1,
      );
      break;

    case "card":
      found = false;
      if (data.checklists) {
        // checklists.sort((a, b) => new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1)
        // for (let checklist of checklists) {
        //     checklist.ChecklistItems.sort((a, b) => new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1)
        // }
      } else {
        data.checklists = [];
      }
      for (const [listId, listCards] of Object.entries(cards.value)) {
        for (let card of listCards) {
          if (card.id == data.id) {
            if (card.listId != data.listId) {
              cards.value[listId] = listCards.filter((c) => c.id != card.id);
              break;
            }
            card.title = data.title;
            card.boardId = data.boardId;
            card.position = data.position;
            card.description = data.description;
            card.listId = data.listId;
            card.checklists = data.checklists;
            card.cardId = data.cardId;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        cards.value[data.listId as string].push({
          id: data.id,
          title: data.title,
          description: data.description,
          position: data.position,
          boardId: data.boardId,
          listId: data.listId,
          cardId: data.cardId,
          checklists: data.checklists,
        });
      }
      for (const [listId, listCards] of Object.entries(cards.value)) {
        cards.value[listId] = listCards.sort((a: Card, b: Card) =>
          a.position < b.position ? -1 : 1,
        );
        for (let card of listCards) {
          card.subcardCount = 0;
          card.subcardsDone = 0;
          card.subcards = 0;
          for (const [, listCards2] of Object.entries(cards.value)) {
            for (let card2 of listCards2) {
              if (card.id == card2.cardId) {
                card.subcards++;
                for (let checklist of card2.checklists) {
                  for (let item of checklist.ChecklistItems) {
                    card.subcardCount++;
                    if (item.checked) card.subcardsDone++;
                  }
                }
              }
            }
          }
        }
      }
      break;

    case "label":
      if (data.delete) {
        labels.value = labels.value.filter((label) => {
          return label.id != data.id;
        });
        break;
      }

      found = false;
      for (let label of labels.value) {
        if (label.id == data.id) {
          label.title = data.title;
          label.boardId = data.boardId;
          label.color = data.color;
          label.textColor = data.textColor;
          found = true;
          break;
        }
      }
      if (!found) {
        labels.value.push({
          id: data.id,
          title: data.title,
          color: data.color,
          boardId: data.boardId,
          textColor: data.textColor,
        });
      }
      break;

    case "assignedLabel":
      if (data.remove) {
        assignedLabels.value = assignedLabels.value.filter((el) => {
          return el.labelId != data.labelId || el.cardId != data.cardId;
        });
      } else {
        assignedLabels.value.push({
          cardId: data.cardId,
          labelId: data.labelId,
        });
      }
      break;

    case "infoItem":
      if (data.delete) {
        infoItems.value = infoItems.value.filter((item) => {
          return item.id != data.id;
        });
        break;
      }

      found = false;
      for (let item of infoItems.value) {
        if (item.id == data.id) {
          item.title = data.title;
          item.content = data.content;
          item.images = JSON.parse(data.images);
          found = true;
          break;
        }
      }
      if (!found) {
        infoItems.value.push({
          id: data.id,
          title: data.title,
          content: data.content,
          boardId: data.boardId,
          images: JSON.parse(data.images),
        });
      }
      break;
  }
};
</script>

<template>
  <ThemeHandler />
  <Board
    :is-combined-view="false"
    :ws="ws"
    :wss="undefined"
    :board="board"
    :lists="lists"
    :cards="cards"
    :labels="labels"
    :assigned-labels="assignedLabels"
    :info-items="infoItems"
  />
</template>
