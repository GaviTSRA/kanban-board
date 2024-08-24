interface BoardCard {
    id: string,
    title: string,
    description: string,
    lists: number,
    cards: number,
    tasks: number,
    done: number,
}

interface Board {
    id: string,
    title: string,
    description: string
}

interface List {
    id: string,
    title: string,
    position: number,
    boardId: string
}

interface Card {
    id: string,
    title: string,
    description: string,
    position: number,
    boardId: string,
    listId: string,
    cardId: string,
    subcardCount?: number,
    subcardsDone?: number,
    subcards?: number,
    checklists: {
        title: string,
        id: string,
        CardId: string,
        ChecklistItems: {
            title: string,
            id: string,
            checked: boolean,
            ChecklistId: string
        }[]
    }[]
}

interface Label {
    id: string,
    boardId: string,
    title: string,
    color: string,
    textColor: string,
    empty?: boolean
}

interface InfoItem {
    id: string,
    boardId: string,
    title: string,
    content: string,
    images: string[]
}