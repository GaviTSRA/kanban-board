import express from "express"
import expressWs from "express-ws"
import cors from "cors"
import WebSocket from "ws"
import bodyParser from 'body-parser';
import { Board, List, Card, BoardAttributes, Label, AssignedLabel, ChecklistItem, Checklist, InfoItem } from "./db.js";

const app = expressWs(express()).app
const port = 3001
app.use(cors())
app.use(bodyParser.json())

app.get("/", async (req, res) => {
    const boards = await Board.findAll()
    let finalBoards = []

    for (let board of boards) {
        // @ts-ignore
        const lists = await List.findAll({where: {BoardId: board.id}})
        // @ts-ignore
        const cards = await Card.findAll({where: {BoardId: board.id},  include: [{
            model: Checklist,
            include: [ ChecklistItem ]
        }]})

        let tasks = 0
        let done = 0

        for (let card of cards) {
            //@ts-ignore
            for (let checklist of card.Checklists) {
                for (let item of checklist.ChecklistItems) {
                    tasks++
                    if (item.checked) done++
                }
            }
        }

        finalBoards.push({
            //@ts-ignore
            "id": board.id,
            //@ts-ignore
            "title": board.title,
            //@ts-ignore
            "description": board.description,
            "lists": lists.length,
            "cards": cards.length,
            "tasks": tasks,
            "done": done,
        })
    }

    res.send(JSON.stringify(finalBoards))
})

app.post("/", async (req, res) => {
    if (!req.body.title) {
        res.sendStatus(400)
        return
    }

    const title = req.body.title
    const description = req.body.description ? req.body.description : ""

    const board = await Board.create({title, description})
    res.send({id:board.get("id")})
})

app.delete("/", async (req, res) => {
    if (!req.body.id || req.body.id == undefined) {
        res.sendStatus(400)
        return
    }

    let board = await Board.findByPk(req.body.id)
    if (!board) {
        res.sendStatus(404)
        return
    }
    let lists = await List.findAll({ where: { BoardId: req.body.id } })
    for (let list of lists) {
        let cards = await Card.findAll({
            where: { // @ts-ignore
                ListId: list.id
            }
        })
        for (let card of cards) card.destroy()
        list.destroy()
    }
    board.destroy() 
    res.sendStatus(200)
})

let clients: {[boardId: string]: WebSocket[]} = {}
function send(boardId: string, data: any) {
    let json = JSON.stringify(data)

    for (let client of clients[boardId]) {
        client.send(json)
    }
}

 app.ws("/board/:boardId", async (ws, req) => {
    let board = await Board.findByPk(req.params.boardId)
    if (board == null) {
        ws.close()
        return
    }

    if (clients[req.params.boardId] == undefined) {
        clients[req.params.boardId] = []
    }
    clients[req.params.boardId].push(ws)

    await sendBoard(ws, board as unknown as BoardAttributes)
    await sendLists(ws, req.params.boardId)
    await sendLabels(ws, req.params.boardId)
    await sendCards(ws, req.params.boardId)

    ws.on("close", () => {
        clients[req.params.boardId].splice(clients[req.params.boardId].indexOf(ws), 1)
    })

    ws.on("message", async msg => {
        const data = JSON.parse(msg.toString())
        if (data.boardId != req.params.boardId) return

        console.log(data.action)
        if (!checkDataValid(data)) {
            console.log("Not valid: ")
            console.log(data)
            return
        }

        switch (data.action) {
            case "updateBoard":
                if (data.title) {
                    board?.set({
                        title: data.title
                    })
                }
                if (data.description != undefined) {
                    board?.set({
                        description: data.description
                    })
                }
                await board?.save()
                await sendBoard(ws, board as unknown as BoardAttributes)
                break

            case "updateList":
                let list
                if (data.new && data.title && data.position != undefined) {
                    list = await List.create({
                        title: data.title,
                        position: data.position,
                        BoardId: data.boardId
                    })
                } else {
                    list = await List.findByPk(data.id)
                    if (!list) return
                    if (data.delete) {
                        let cards = await Card.findAll({
                            where: { // @ts-ignore
                                ListId: list.id
                            }
                        })
                        for (let card of cards) card.destroy()
                        list?.destroy()
                        send(req.params.boardId, {
                            "type": "list",
                            "id": data.id,
                            "delete": true
                        })
                        return
                    }
                    if (data.title != undefined) {
                        list?.set({
                            title: data.title
                        })
                    }
                    if (data.position != undefined) {
                        list?.set({
                            position: data.position
                        })
                    }
                    await list?.save()
                }
                if (!data.delete)
                    await sendList(ws, list)
                break

            case "updateCard":
                let card
                if (data.new) {
                    if (!data.title || data.position == undefined || !data.listId) return
                    card = await Card.create({
                        title: data.title,
                        position: data.position,
                        BoardId: data.boardId,
                        ListId: data.listId
                    })
                } else {
                    card = await Card.findByPk(data.id, {
                        include: [{
                            model: Checklist,
                            include: [ ChecklistItem ]
                        }]
                    })
                    if (!card) return
                    if (data.delete) {
                        card?.destroy()
                        send(req.params.boardId, {
                            "type": "card",
                            "id": data.id,
                            "delete": true
                        })
                        return
                    }
                    if (data.cardId != undefined) {
                        let cardId = data.cardId
                        if (data.cardId == "remove") cardId = null
                        card?.set({
                            CardId: cardId
                        })
                    }
                    if (data.title != undefined) {
                        card?.set({
                            title: data.title
                        })
                    }
                    if (data.position != undefined) {
                        card?.set({
                            position: data.position
                        })
                    }
                    if (data.description != undefined) {
                        card?.set({
                            description: data.description
                        })
                    } 
                    if (data.listId != undefined) {
                        card?.set({
                            ListId: data.listId
                        })
                    }
                    if (data.checklists != undefined) {
                        for (let checklist of data.checklists) {
                            if (checklist.new) {
                                Checklist.create({
                                    "CardId": data.id
                                })
                            } else {
                                let dbChecklist = await Checklist.findByPk(checklist.id)
                                if (!dbChecklist) return
                                if (checklist.delete) {
                                    dbChecklist?.destroy()
                                } else {
                                    dbChecklist?.set({
                                        title: checklist.title,
                                        CardId: checklist.cardId
                                    })
                                    await dbChecklist?.save()
                                }
                                for (let item of checklist.ChecklistItems) {
                                    if (item.new) {
                                        await ChecklistItem.create({
                                            "ChecklistId": checklist.id
                                        })
                                    } else {
                                        let dbItem = await ChecklistItem.findByPk(item.id)
                                        if (!dbItem) return
                                        if (item.delete || checklist.delete) {
                                            dbItem?.destroy()
                                        } else {
                                            dbItem?.set({
                                                title: item.title,
                                                ChecklistId: checklist.cardId,
                                                checked: item.checked
                                            })
                                            dbItem?.save()
                                        }
                                    }
                                }
                            }
                        }
                    }
                    await card?.save()
                    card = await Card.findByPk(data.id, {
                        include: [{
                            model: Checklist,
                            include: [ ChecklistItem ]
                        }]
                    })
                    if (!card) return
                }
                if (!data.delete)
                    await sendCard(ws, card)
                break
        
            case "updateLabel":
                let label
                if (data.new) {
                    label = await Label.create({
                        BoardId: data.boardId
                    })
                } else {
                    label = await Label.findByPk(data.id)
                    if (!label) return
                    if (data.delete) {
                        label?.destroy()
                        send(req.params.boardId, {
                            "type": "label",
                            "id": data.id,
                            "delete": true
                        })
                    }
                    if (data.title != undefined) {
                        label?.set({
                            title: data.title
                        })
                    }
                    if (data.color != undefined) {
                        label?.set({
                            color: data.color
                        })
                    }
                    if (data.textColor != undefined) {
                        label?.set({
                            textColor: data.textColor
                        })
                    }
                    await label?.save()
                }
                await sendLabel(label)
                break

            case "toggleLabel":
                if (data.labelId && data.cardId) {
                    let assignment = await AssignedLabel.findOne({
                        where: {
                            LabelId: data.labelId,
                            CardId: data.cardId
                        }
                    })
                    if (assignment == null) {
                        assignment = await AssignedLabel.create({
                            LabelId: data.labelId,
                            BoardId: data.boardId,
                            CardId: data.cardId
                        })
                        send(data.boardId, {
                            "type": "assignedLabel", // @ts-ignore
                            "labelId": assignment.LabelId, // @ts-ignore
                            "boardId": assignment.BoardId, // @ts-ignore
                            "cardId": assignment.CardId
                        })
                    } else {
                        send(data.boardId, {
                            "type": "assignedLabel", // @ts-ignore
                            "labelId": assignment.LabelId, // @ts-ignore
                            "boardId": assignment.BoardId, // @ts-ignore
                            "cardId": assignment.CardId,
                            "remove": true
                        })
                        assignment.destroy()
                    }
                }
                break
            
            case "updateInfoItem":
                let item
                if (data.new) {
                    item = await InfoItem.create({
                        BoardId: data.boardId,
                        title: data.title,
                        content: data.content
                    })
                } else {
                    item = await InfoItem.findByPk(data.id)
                    if (!item) return
                    if (data.delete) {
                        item?.destroy()
                        send(req.params.boardId, {
                            "type": "infoItem",
                            "id": data.id,
                            "delete": true
                        })
                    }
                    if (data.title != undefined) {
                        item?.set({
                            title: data.title
                        })
                    }
                    if (data.content != undefined) {
                        item?.set({
                            content: data.content
                        })
                    }
                    await item?.save()
                }
                await sendInfoItem(data.boardId, item)
                break
        }
    })
})

function checkDataValid(data: any) {
    if (data.title != undefined && (data.title == "" || typeof data.title != "string" || data.title.length > 20)) return false
    if (data.description && (typeof data.description != "string" || data.description.length > 125)) return false
    if (data.position && typeof data.position != "number") return false
    if (data.id && !(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(data.id))) return false
    if (data.listId && !(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(data.listId))) return false
    if (data.cardId && (!(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(data.cardId)) && data.cardId != "remove")) return false
    return true
}

async function sendBoard(ws: WebSocket, board: BoardAttributes) {
    send(board.id, {
        "type": "board",       // @ts-ignore
        "id": board.id,       // @ts-ignore
        "title": board?.title, // @ts-ignore
        "description": board?.description
    })
    let infoItems = await InfoItem.findAll({
        where: {
            BoardId: board.id
        }
    })

    for (let item of infoItems) {
        sendInfoItem(board.id, item)
    }
}

async function sendLists(ws: WebSocket, boardId: string) {
    let lists = await List.findAll({
        where: {
            BoardId: boardId
        }
    })
    for (let list of lists) {
        sendList(ws, list)
    }
}

async function sendList(ws: WebSocket, list: any) {
    send(list.BoardId, {
        "type": "list",
        "id": list.id,
        "title": list.title,
        "position": list.position,
        "boardId": list.BoardId
    })
}

async function sendCards(ws: WebSocket, boardId: string) {
    let lists = await List.findAll({
        where: {
            BoardId: boardId
        }
    })
    for (let list of lists) {
        let cards = await Card.findAll({
            where: { // @ts-ignore
                ListId: list.id
            },
            include: [{
                model: Checklist,
                include: [ ChecklistItem ]
            }]
        })
        for (let card of cards) {
            sendCard(ws, card)
        }
    }
}

async function sendCard(ws: WebSocket, card: any) {
    let boardId = card.BoardId
    if (!boardId) boardId = card.boardId
    send(boardId, {
        "type": "card",
        "id": card.id,
        "boardId": card.BoardId,
        "listId": card.ListId,
        "title": card.title,
        "description": card.description,
        "position": card.position,
        "checklists": card.Checklists,
        "cardId": card.CardId
    })
}

async function sendLabels(ws: WebSocket, boardId: string) {
    let labels = await Label.findAll({
        where: {
            BoardId: boardId
        },
        include: Card
    })
    // send(boardId, {"type": "clearAssignedLabels"})
    for (let label of labels) {
        sendLabel(label)
    }
}

async function sendLabel(label: any) {
    send(label.BoardId, {
        "type": "label", // @ts-ignore
        "id": label.id, // @ts-ignore
        "boardId": label.BoardId, // @ts-ignore
        "title": label.title, // @ts-ignore
        "color": label.color, // @ts-ignore
        "textColor": label.textColor
    })
    let assignments = await AssignedLabel.findAll({
        where: {
            BoardId: label.BoardId, //@ts-ignore
            LabelId: label.id
        }
    })
    for (let assignment of assignments) {
        send(label.BoardId, {
            "type": "assignedLabel", // @ts-ignore
            "labelId": assignment.LabelId, // @ts-ignore
            "boardId": assignment.BoardId, // @ts-ignore
            "cardId": assignment.CardId
        })
    }
}

async function sendInfoItem(boardId: string, item: any) {
    send(boardId, {
        "type": "infoItem",
        "id": item.id,
        "title": item.title,
        "content": item.content,
        "boardId": boardId
    })
}

app.listen(port, () => {
    console.log(`Running on port ${port}`)
})