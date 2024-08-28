import { defineStore } from "pinia";

export const useConnection = defineStore("connection", {
  state: () => {
    return {
      ws: undefined as WebSocket | undefined,
    };
  },
  getters: {},
  actions: {
    init(websocket: WebSocket) {
      this.ws = websocket;
    },
    send(data: any) {
      if (!this.ws) return;
      this.ws.send(JSON.stringify(data));
    },

    updateBoardTitle(title: string) {
      this.send({
        action: "updateBoard",
        title,
      });
    },
    updateBoardDescription(description: string) {
      this.send({
        action: "updateBoard",
        description,
      });
    },

    createList(boardId: string, title: string, position: number) {
      this.send({
        action: "updateList",
        new: true,
        boardId,
        title,
        position,
      });
    },
    updateListTitle(id: string, title: string) {
      this.send({
        action: "updateList",
        id,
        title,
      });
    },
    updateListPosition(id: string, position: number) {
      this.send({
        action: "updateList",
        id,
        position,
      });
    },
    deleteList(id: string) {
      this.send({
        action: "updateList",
        delete: true,
        id,
      });
    },

    createCard(listId: string, title: string, position: number) {
      this.send({
        action: "updateCard",
        new: true,
        listId,
        title,
        position,
      });
    },
    updateCardTitle(id: string, title: string) {
      this.send({
        action: "updateCard",
        id,
        title,
      });
    },
    updateCardDescription(id: string, description: string) {
      this.send({
        action: "updateCard",
        id,
        description,
      });
    },
    updateCardPosition(id: string, position: number) {
      this.send({
        action: "updateCard",
        id,
        position,
      });
    },
    assignCard(id: string, cardId: string | null) {
      this.send({
        action: "updateCard",
        id,
        cardId,
      });
    },
    deleteCard(id: string) {
      this.send({
        action: "updateCard",
        delete: true,
        id,
      });
    },

    createLabel(boardId: string) {
      this.send({
        action: "updateLabel",
        new: true,
        boardId,
      });
    },
    updateLabel(id: string, title: string, textColor: string, color: string) {
      this.send({
        action: "updateLabel",
        id,
        title,
        textColor,
        color,
      });
    },
    deleteLabel(id: string) {
      this.send({
        action: "updateLabel",
        delete: true,
        id,
      });
    },

    toggleLabel(labelId: string, cardId: string) {
      this.send({
        action: "toggleLabel",
        cardId,
        labelId,
      });
    },

    createInfoItem(title: string, content: string) {
      this.send({
        action: "updateInfoItem",
        new: true,
        title,
        content,
      });
    },
    updateInfoItem(id: string, title: string, content: string) {
      this.send({
        action: "updateInfoItem",
        id,
        title,
        content,
      });
    },
    updateInfoItemImages(id: string, images: string[]) {
      this.send({
        action: "updateInfoItem",
        id,
        images: JSON.stringify(images),
      });
    },
    deleteInfoItem(id: string) {
      this.send({
        action: "updateInfoItem",
        id,
        delete: true,
      });
    },
  },
});
