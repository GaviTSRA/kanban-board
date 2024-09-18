import { db } from "~/db ";
import * as schema from "../../schema.js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body.title) {
    setResponseStatus(event, 400);
    return;
  }

  const title = body.title;
  const description = body.description ? body.description : "";

  const created: schema.Board[] = await db
    .insert(schema.board)
    .values({ title, description })
    .returning();
  return { id: created[0].id };
});
