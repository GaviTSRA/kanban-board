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
  checklists: Checklist[];
};

export type Checklist = {
  id: string;
  cardId: string;
  title: string;
  checklistItems: ChecklistItem[];
};

export type ChecklistItem = {
  id: string;
  checklistId: string;
  title: string;
  checked: boolean;
  position: number;
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
