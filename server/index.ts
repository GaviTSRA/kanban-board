import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import WebSocket from "ws";
import bodyParser from "body-parser";
import * as schema from "./schema.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { and, eq, SQLWrapper } from "drizzle-orm";

const client = postgres({
  db: "kanban",
  host: "localhost",
  username: "postgres",
  password: "postgres",
});
const db = drizzle(client, { schema });

const app = expressWs(express()).app;
const port = 3001;
app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  const boards = await db.query.board.findMany({
    with: {
      lists: {
        with: {
          cards: {
            with: {
              checklists: {
                with: {
                  checklistItems: true,
                },
              },
            },
          },
        },
      },
    },
  });
  let finalBoards = [];

  for (let board of boards) {
    let cards = 0;
    let tasks = 0;
    let done = 0;

    for (let list of board.lists) {
      for (let card of list.cards) {
        cards++;
        for (let checklist of card.checklists) {
          for (let item of checklist.checklistItems) {
            tasks++;
            if (item.checked) done++;
          }
        }
      }
    }

    finalBoards.push({
      id: board.id,
      title: board.title,
      description: board.description,
      lists: board.lists.length,
      cards: cards,
      tasks: tasks,
      done: done,
    });
  }

  res.send(JSON.stringify(finalBoards));
});

app.post("/", async (req, res) => {
  console.info(req.body)
  if (!req.body.title) {
    res.sendStatus(400);
    return;
  }

  const title = req.body.title;
  const description = req.body.description ? req.body.description : "";

  const created: schema.Board[] = await db
    .insert(schema.board)
    .values({ title, description })
    .returning();
  res.send({ id: created[0].id });
});

app.delete("/", async (req, res) => {
  if (!req.body.id || req.body.id == undefined) {
    res.sendStatus(400);
    return;
  }

  let board = await db.query.board.findFirst({
    where: (board, { eq }) => eq(board.id, req.body.id),
  });
  if (!board) {
    res.sendStatus(404);
    return;
  }
  await db.delete(schema.board).where(eq(schema.board.id, req.body.id));

  res.sendStatus(200);
});

let clients: { [boardId: string]: WebSocket[] } = {};
function send(boardId: string, data: any) {
  let json = JSON.stringify(data);

  for (let client of clients[boardId]) {
    client.send(json);
  }
}

app.ws("/board/:boardId", async (ws, req) => {
  const boardId = req.params.boardId;
  let board = await db.query.board.findFirst({
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

    switch (data.action) {
      case "updateBoard":
        await db
          .update(schema.board)
          .set(data)
          .where(eq(schema.board.id, boardId));
        await sendBoard(boardId);
        break;

      case "updateList":
        let list;
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
        let card;
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
        let cardId: string;
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
        let foundCard = await db.query.card.findFirst({
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
        let checklistId: string;
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
        let checklistCard = (
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
        let label, labelId;
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
        let item;
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

async function sendBoard(boardId: string) {
  const board = await db.query.board.findFirst({
    where: (board, { eq }) => eq(board.id, boardId),
  });
  if (!board) return; // TODO handle error
  send(board.id, {
    type: "board",
    ...board,
  });

  let infoItems = await db.query.infoItem.findMany({
    where: (infoItem, { eq }) => eq(infoItem.boardId, boardId),
  });
  for (let item of infoItems) {
    sendInfoItem(board.id, item);
  }
}

async function sendLists(boardId: string) {
  let lists = await db.query.list.findMany({
    where: (list, { eq }) => eq(list.boardId, boardId),
  });
  for (let list of lists) {
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
  let lists = await db.query.list.findMany({
    where: (list, { eq }) => eq(list.boardId, boardId),
  });
  for (let list of lists) {
    let cards = await db.query.card.findMany({
      where: (card, { eq }) => eq(card.listId, list.id),
      with: {
        checklists: {
          with: {
            checklistItems: true,
          },
        },
      },
    });
    for (let card of cards) {
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
  let labels = await db.query.label.findMany({
    where: (label, { eq }) => eq(label.boardId, boardId),
    with: {
      labelAssignments: true,
    },
  });
  // send(boardId, {"type": "clearAssignedLabels"})
  for (let label of labels) {
    sendLabel(label);
  }
}

async function sendLabel(
  label: schema.Label & { labelAssignments: schema.AssignedLabel[] }
) {
  send(label.boardId, {
    type: "label",
    ...label,
  });
  for (let assignment of label.labelAssignments) {
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

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
