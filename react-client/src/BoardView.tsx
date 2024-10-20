import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash } from 'react-feather';
import ContextMenu, { Action } from "./components/ContextMenu";
import ChoicePopup from "./components/ChoicePopup";
import { useNavigate } from "react-router-dom";

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
  const [deleteBoardMenuOpen, setDeleteBoardMenuOpen] = useState(false);
  const [deleteBoardId, setDeleteBoardId] = useState(null);

  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);

  const navigate = useNavigate();

  const {
    isPending,
    error,
    data: boards,
    refetch: refetchBoards
  } = useQuery({
    queryKey: ["boards"],
    queryFn: () => fetch("http://localhost:3001").then((res) => res.json()),
  });

  const createBoard = useMutation({
    mutationFn: () => {
      return fetch("http://localhost:3001", {
        method: "POST",
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({
          title,
          description
        })
      })
    },
  })

  const deleteBoard = useMutation({
    mutationFn: () => {
      return fetch("http://localhost:3001", {
        method: "DELETE",
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({
          id: deleteBoardId
        })
      })
    },
  })

  if (isPending) return "Loading...";
  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="bg-background min-h-full">
      {/* <UserSettings v-if="settingsOpened" /> */}
      {deleteBoardMenuOpen && (
        <ChoicePopup title="Delete board?" onClose={() => setDeleteBoardMenuOpen(false)}
          left={{
            label: "Cancel",
            action: () => setDeleteBoardMenuOpen(false)
          }}
          right={{
            label: "Confirm",
            danger: true,
            action: () => {
              deleteBoard.mutate(null, {
                onSuccess: () => refetchBoards()
              });
              setDeleteBoardMenuOpen(false);
            }
          }} />
      )}

      <div className="w-full bg-header flex items-center">
        <p className="p-4 bg-card w-fit ml-2 my-2 rounded">
          Kanban Boards
        </p>
        {/* <button
          // class="settingsButton"
          onClick={() => setSettingsOpened(!settingsOpened)}
        /> */}
      </div>

      <div className="flex flex-col justify-center">
        <div className="grid grid-cols-3 w-fit mx-auto gap-4 mt-4">
          {boards.map((board: Board) => {
            const actions: Action[] = [
              {
                name: "Delete Board",
                danger: true,
                action: () => {
                  setDeleteBoardId(board.id);
                  setDeleteBoardMenuOpen(true);
                },
                icon: <Trash />
              }
            ]
            return (
              <ContextMenu actions={actions}>
                <div className="flex flex-col w-[20vw] h-[40vh] bg-card hover:bg-card-hover p-4 rounded">
                  <p className="font-bold">{board.title}</p>
                  <p>{board.description}</p>
                  <div className="mt-auto">
                    <p>{board.lists} Lists</p>
                    <p>{board.cards} Cards</p>
                  </div>
                </div>
              </ContextMenu>
            );
          })}
          <div
            className="flex bg-background border-card hover:bg-button-hover border-2 rounded w-[20vw] h-[40vh]"
            onClick={() => setCreatingNewBoard(true)}
          >
            <div className="p-4 flex m-auto"><Plus /></div>
          </div>
        </div>
      </div>

      {creatingNewBoard && (
        <div className="fixed top-0 w-screen h-screen flex bg-black/75" onClick={() => setCreatingNewBoard(false)}>
          <div className="bg-list p-4 m-auto rounded flex flex-col w-1/4" onClick={(e) => e.stopPropagation()}>
            <p className="text-2xl mb-4">Create New Board</p>
            <div className="mb-4">
              <p className="text-secondary-text">Title</p>
              <input
                className="rounded bg-card outline-none px-2 py-1 w-full"
                onChange={setTitle}
              />
            </div>
            <div className="mb-4 h-full">
              <p className="text-secondary-text">Description</p>
              <textarea
                className="rounded bg-card outline-none px-2 py-1 w-full h-40 resize-none"
                onChange={setDescription}
              />
            </div>
            <button
              className="px-4 py-2 mt-auto bg-success rounded outline-none"
              onClick={() => {
                createBoard.mutate(null, {
                  onSuccess: result => navigate("/board/" + result)
                })
              }}
            >Create</button>
          </div>
          {/* <input />
          <textarea /> */}
          {/* <button onClick={() => {
            createBoard.mutate(null, {
              onSuccess: () => { }
            })
          }}>Create</button> */}
        </div>
      )
      }
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
    </div >
  );
}
