import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { List as ListType } from "./types";
import List from "./components/List";

export default function Board() {
  const { boardId } = useParams();

  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [lists, setLists] = useState([] as ListType[]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001/board/" + boardId);
    ws.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      switch (data.type) {
        case "board":
          setBoardTitle(data.title);
          setBoardDescription(data.description);
          break;
        case "list":
          if (data.delete) {
            setLists((oldLists) => {
              oldLists.filter((list) => list.id !== data.id);
              return oldLists;
            });
            break;
          }
          setLists((oldLists) => [
            ...oldLists.filter((list) => list.id !== data.id),
            {
              id: data.id,
              title: data.title,
              position: data.position,
              boardId: data.boardId,
            },
          ]);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, [boardId]);

  return (
    <div className="bg-background h-full">
      <div className="w-full bg-header flex items-center gap-4">
        <p className="px-4 py-2 bg-card w-fit ml-2 my-2 rounded">
          {boardTitle}
        </p>
        <p>{boardDescription}</p>
      </div>
      <div className="flex flex-row gap-4 m-4">
        {lists.map((list) => {
          return <List key={list.id} list={list} />;
        })}
      </div>
    </div>
  );
}
