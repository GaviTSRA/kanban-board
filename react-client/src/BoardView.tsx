import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type Board = {
  id: string;
  title: string;
  description: string;
  lists: number;
  cards: number;
  tasks: number;
  done: number;
};

export default function App() {
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [creatingNewBoard, setCreatingNewBoard] = useState(false);

  const {
    isPending,
    error,
    data: boards,
  } = useQuery({
    queryKey: ["boards"],
    queryFn: () => fetch("http://localhost:3001").then((res) => res.json()),
  });

  if (isPending) return "Loading...";
  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="bg-background-primary h-full">
      {/* <UserSettings v-if="settingsOpened" /> */}

      <div className="w-full bg-[#2C2C44] flex items-center">
        <p className="p-4 bg-[#3C3F58] w-fit ml-2 my-2 rounded">
          Kanban Boards
        </p>
        <button
          // class="settingsButton"
          onClick={() => setSettingsOpened(!settingsOpened)}
        />
      </div>

      <div className="flex flex-col justify-center">
        <div className="grid grid-cols-3 w-fit mx-auto gap-4 mt-4">
          {boards.map((board: Board) => {
            console.info(board);
            return (
              <div className="flex flex-col w-[10vw] h-[20vh] bg-[#3C3F58] hover:bg-[#4E527D] p-4 rounded">
                <p className="font-bold">{board.title}</p>
                <p>{board.description}</p>
                <div className="mt-auto">
                  <p>{board.lists} Lists</p>
                  <p>{board.cards} Cards</p>
                </div>
              </div>
            );
          })}
          <div
            className="flex border-dotted bg-[#28293D] border-[#3C3F58] border-2 rounded"
            onClick={() => setCreatingNewBoard(true)}
          >
            <div className="p-4">a</div>
          </div>
        </div>
      </div>

      {/* <div
        v-if="creatingNewBoard"
        class="createDarken"
        onClick="() => (creatingNewBoard = false)"
      ></div>
      <div v-if="creatingNewBoard" class="create">
        <h1>Create new board</h1>
        <label for="title">Title</label>
        <input id="title" v-model="title" maxlength="20" type="text" />
        <label for="description">Description</label>
        <textarea id="description" v-model="description" maxlength="125" />
        <button class="confirm" onClick="createBoard">Create</button>
      </div> */}
    </div>
  );
}
