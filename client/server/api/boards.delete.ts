import { db } from "~/db ";
import * as schema from "../../schema.js";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body.id || body.id == undefined) {
    setResponseStatus(event, 400);
    return;
  }

  const board = await db.query.board.findFirst({
    where: (board, { eq }) => eq(board.id, body.id),
  });
  if (!board) {
    setResponseStatus(event, 404);
    return;
  }
  await db.delete(schema.board).where(eq(schema.board.id, body.id));

  setResponseStatus(event, 200);
});
