import { db } from "~/db ";

export default defineEventHandler(async () => {
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
  const finalBoards = [];

  for (const board of boards) {
    let cards = 0;
    let tasks = 0;
    let done = 0;

    for (const list of board.lists) {
      for (const card of list.cards) {
        cards++;
        for (const checklist of card.checklists) {
          for (const item of checklist.checklistItems) {
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

  return JSON.stringify(finalBoards);
});
