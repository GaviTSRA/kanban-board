export type BoardCard = {
  id: string;
  title: string;
  description: string;
  lists: number;
  cards: number;
  tasks: number;
  done: number;
};

export type Board = {
  id: string;
  title: string;
  description: string;
};

export type List = {
  id: string;
  title: string;
  position: number;
  boardId: string;
};

export type Card = {
  id: string;
  title: string;
  description: string;
  position: number;
  boardId: string;
  listId: string;
  cardId: string;
  subcardCount?: number;
  subcardsDone?: number;
  subcards?: number;
  checklists: {
    title: string;
    id: string;
    CardId: string;
    ChecklistItems: {
      title: string;
      id: string;
      checked: boolean;
      ChecklistId: string;
    }[];
  }[];
};

export type Label = {
  id: string;
  boardId: string;
  title: string;
  color: string;
  textColor: string;
  empty?: boolean;
};

export type InfoItem = {
  id: string;
  boardId: string;
  title: string;
  content: string;
  images: string[];
};
