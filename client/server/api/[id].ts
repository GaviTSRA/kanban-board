import { WebSocketServer, WebSocket } from "ws";
import { defineEventHandler, H3Event } from "h3";
import type { IncomingMessage, ServerResponse } from "http";
import { db } from "~/db ";

import * as schema from "../../schema.js";
import { and, eq } from "drizzle-orm";

let wss: WebSocketServer | null = null;

const clients: { [boardId: string]: WebSocket[] } = {};
function send(boardId: string, data: any) {
  const json = JSON.stringify(data);

  for (const client of clients[boardId]) {
    client.send(json);
  }
}

export default defineEventHandler(async (event: H3Event) => {
  if (!wss) {
    const server = event.node.res.socket.server as ServerResponse & {
      server: any;
    };

    wss = new WebSocketServer({ noServer: true });

     
    server.on(
      "upgrade",
      (request: IncomingMessage, socket: any, head: Buffer) => {
        wss?.handleUpgrade(
          request,
          socket,
          head,
          (client: WebSocket, request: IncomingMessage) => {
            wss?.emit("connection", client, request);
          },
        );
      },
    );

    wss.on("connection", async (ws: WebSocket) => {
      const boardId = getRouterParam(event, 'id') as string;
      const board = await db.query.board.findFirst({
        where: (board, { eq }) => eq(board.id, boardId),
      });
      if (board == null) {
        ws.close();
        return;
      }

      if (clients[boardId] == undefined) {
        clients[boardId] = [];
      }
      clients[boardId].push(ws);

      await sendBoard(boardId);
      await sendLists(boardId);
      await sendLabels(boardId);
      await sendCards(boardId);

      ws.on("close", () => {
        clients[boardId].splice(clients[boardId].indexOf(ws), 1);
      });
      ws.on("message", async (msg) => {
        const data = JSON.parse(msg.toString());
        console.log(data);
        let list, card, cardId, foundCard, checklistId, checklistCard, label, labelId, item;
    
        switch (data.action) {
          case "updateBoard":
            await db
              .update(schema.board)
              .set(data)
              .where(eq(schema.board.id, boardId));
            await sendBoard(boardId);
            break;
    
          case "updateList":
            if (data.new && data.title && data.position !== undefined) {
              list = (await db.insert(schema.list).values(data).returning())[0];
            } else if (data.delete) {
              await db.delete(schema.card).where(eq(schema.card.listId, data.id));
              await db.delete(schema.list).where(eq(schema.list.id, data.id));
              send(boardId, {
                type: "list",
                id: data.id,
                delete: true,
              });
              return;
            } else {
              list = (
                await db
                  .update(schema.list)
                  .set(data)
                  .where(eq(schema.list.id, data.id))
                  .returning()
              )[0];
            }
            await sendList(list);
            break;
    
          case "updateCard":
            if (data.new) {
              card = (await db.insert(schema.card).values(data).returning())[0];
            } else if (data.delete) {
              await db.delete(schema.card).where(eq(schema.card.id, data.id));
              send(boardId, {
                type: "card",
                id: data.id,
                delete: true,
              });
              return;
            } else {
              await db
                .update(schema.card)
                .set(data)
                .where(eq(schema.card.id, data.id));
              card = await db.query.card.findFirst({
                where: (card, { eq }) => eq(card.id, data.id),
                with: {
                  checklists: {
                    with: {
                      checklistItems: true,
                    },
                  },
                },
              });
            }
            if (card) {
              await sendCard(boardId, card);
            }
            break;
    
          case "updateChecklist":
            if (data.new) {
              cardId = (
                await db.insert(schema.checklist).values(data).returning()
              )[0].cardId;
            } else if (data.delete) {
              cardId = (
                await db
                  .delete(schema.checklist)
                  .where(eq(schema.checklist.id, data.id))
                  .returning()
              )[0].cardId;
            } else {
              cardId = (
                await db
                  .update(schema.checklist)
                  .set(data)
                  .where(eq(schema.checklist.id, data.id))
                  .returning()
              )[0].cardId;
            }
            foundCard = await db.query.card.findFirst({
              where: (card, { eq }) => eq(card.id, cardId),
              with: {
                checklists: {
                  with: {
                    checklistItems: true,
                  },
                },
              },
            });
            if (foundCard) sendCard(boardId, foundCard);
            break;
    
          case "updateChecklistItem":
            if (data.new) {
              checklistId = (
                await db.insert(schema.checklistItem).values(data).returning()
              )[0].checklistId;
            } else if (data.delete) {
              checklistId = (
                await db
                  .delete(schema.checklistItem)
                  .where(eq(schema.checklistItem.id, data.id))
                  .returning()
              )[0].checklistId;
            } else {
              checklistId = (
                await db
                  .update(schema.checklistItem)
                  .set(data)
                  .where(eq(schema.checklistItem.id, data.id))
                  .returning()
              )[0].checklistId;
            }
            checklistCard = (
              await db.query.checklist.findFirst({
                where: (checklist, { eq }) => eq(checklist.id, checklistId),
                with: {
                  card: {
                    with: {
                      checklists: {
                        with: {
                          checklistItems: true,
                        },
                      },
                    },
                  },
                },
              })
            )?.card;
            if (checklistCard) sendCard(boardId, checklistCard);
            break;
    
          case "updateLabel":
            if (data.new) {
              labelId = (await db.insert(schema.label).values(data).returning())[0]
                .id;
            } else if (data.delete) {
              await db.delete(schema.label).where(eq(schema.label.id, data.id));
              send(boardId, {
                type: "label",
                id: data.id,
                delete: true,
              });
              return;
            } else {
              labelId = (
                await db
                  .update(schema.label)
                  .set(data)
                  .where(eq(schema.label.id, data.id))
                  .returning()
              )[0].id;
            }
            label = await db.query.label.findFirst({
              where: (label, { eq }) => eq(label.id, labelId),
              with: {
                labelAssignments: true,
              },
            });
            if (label) {
              await sendLabel(label);
            }
            break;
    
          case "toggleLabel":
            if (data.labelId && data.cardId) {
              let assignment = await db.query.assignedLabel.findFirst({
                where: (assignment, { eq }) =>
                  and(
                    eq(assignment.labelId, data.labelId),
                    eq(assignment.cardId, data.cardId)
                  ),
              });
              if (assignment == null) {
                assignment = (
                  await db.insert(schema.assignedLabel).values(data).returning()
                )[0];
                send(boardId, {
                  type: "assignedLabel",
                  ...assignment,
                });
              } else {
                send(boardId, {
                  type: "assignedLabel",
                  ...assignment,
                  remove: true,
                });
                await db
                  .delete(schema.assignedLabel)
                  .where(
                    and(
                      eq(schema.assignedLabel.labelId, data.labelId),
                      eq(schema.assignedLabel.cardId, data.cardId)
                    )
                  );
              }
            }
            break;
    
          case "updateInfoItem":
            if (data.new) {
              item = (await db.insert(schema.infoItem).values(data).returning())[0];
            } else if (data.delete) {
              await db
                .delete(schema.infoItem)
                .where(eq(schema.infoItem.id, data.id));
              send(boardId, {
                type: "infoItem",
                id: data.id,
                delete: true,
              });
              return;
            } else {
              item = (
                await db
                  .update(schema.infoItem)
                  .set(data)
                  .where(eq(schema.infoItem.id, data.id))
                  .returning()
              )[0];
            }
            await sendInfoItem(boardId, item);
            break;
        }
      });
    });
  }
});

async function sendBoard(boardId: string) {
  const board = await db.query.board.findFirst({
    where: (board, { eq }) => eq(board.id, boardId),
  });
  if (!board) return; // TODO handle error
  send(board.id, {
    type: "board",
    ...board,
  });

  const infoItems = await db.query.infoItem.findMany({
    where: (infoItem, { eq }) => eq(infoItem.boardId, boardId),
  });
  for (const item of infoItems) {
    sendInfoItem(board.id, item);
  }
}

async function sendLists(boardId: string) {
  const lists = await db.query.list.findMany({
    where: (list, { eq }) => eq(list.boardId, boardId),
  });
  for (const list of lists) {
    sendList(list);
  }
}

async function sendList(list: schema.List) {
  send(list.boardId, {
    type: "list",
    ...list,
  });
}

async function sendCards(boardId: string) {
  const lists = await db.query.list.findMany({
    where: (list, { eq }) => eq(list.boardId, boardId),
  });
  for (const list of lists) {
    const cards = await db.query.card.findMany({
      where: (card, { eq }) => eq(card.listId, list.id),
      with: {
        checklists: {
          with: {
            checklistItems: true,
          },
        },
      },
    });
    for (const card of cards) {
      sendCard(boardId, card);
    }
  }
}

async function sendCard(boardId: string, card: schema.Card) {
  send(boardId, {
    type: "card",
    ...card,
    boardId,
  });
}

async function sendLabels(boardId: string) {
  const labels = await db.query.label.findMany({
    where: (label, { eq }) => eq(label.boardId, boardId),
    with: {
        labelAssignments: true,
    },
  });
  // send(boardId, {"type": "clearAssignedLabels"})
  for (const label of labels) {
    sendLabel(label);
  }
}

async function sendLabel(
  label: schema.Label & { labelAssignments: schema.AssignedLabel[] },
) {
  send(label.boardId, {
    type: "label",
    ...label,
  });
  for (const assignment of label.labelAssignments) {
    send(label.boardId, {
      type: "assignedLabel",
      labelId: assignment.labelId,
      boardId: label.boardId,
      cardId: assignment.cardId,
    });
  }
}

async function sendInfoItem(boardId: string, item: any) {
  send(boardId, {
    type: "infoItem",
    ...item,
  });
}
