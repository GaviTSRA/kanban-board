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
