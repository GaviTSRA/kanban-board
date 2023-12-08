import express from "express"
import expressWs, { WebsocketMethod } from "express-ws"
import cors from "cors"
import WebSocket from "ws"
import bodyParser from 'body-parser';
import { Board, List, Card, BoardAttributes, Label, ListAttributes, AssignedLabel, ChecklistItem, Checklist } from "./db.js";

const app = expressWs(express()).app
const port = 3001
app.use(cors())
app.use(bodyParser.json())

app.get("/", async (req, res) => {
    const boards = await Board.findAll()
    res.send(JSON.stringify(boards))
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
    if (!req.body.id) {
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

 app.ws("/board/:boardId", async (ws, req) => {
    let board = await Board.findByPk(req.params.boardId)
    if (board == null) {
        ws.close()
        return
    }

    await sendBoard(ws, board as unknown as BoardAttributes)  // TODO fix ts
    await sendLists(ws, req.params.boardId)
    await sendCards(ws, req.params.boardId)
    await sendLabels(ws, req.params.boardId)

    ws.on("message", async msg => {
        const data = JSON.parse(msg.toString())
        if (data.boardId != req.params.boardId) return

        console.log(data.action)

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
                await sendBoard(ws, board as unknown as BoardAttributes) // TODO fix ts
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
                    if (data.delete) {
                        let cards = await Card.findAll({
                            where: { // @ts-ignore
                                ListId: list.id
                            }
                        })
                        for (let card of cards) card.destroy()
                        list?.destroy()
                        ws.send(JSON.stringify({
                            "type": "list",
                            "id": data.id,
                            "delete": true
                        }))
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
                    if (data.delete) {
                        card?.destroy()
                        ws.send(JSON.stringify({
                            "type": "card",
                            "id": data.id,
                            "delete": true
                        }))
                        return
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
                }
                if (!data.delete)
                    await sendCard(ws, card)
                break
        
            case "updateLabel":
                if (data.new) {
                    await Label.create({
                        BoardId: data.boardId
                    })
                } else {
                    let label = await Label.findByPk(data.id)
                    if (data.delete) {
                        label?.destroy()
                        ws.send(JSON.stringify({
                            "type": "label",
                            "id": data.id,
                            "delete": true
                        }))
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
                await sendLabels(ws, req.params.boardId)
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
                        AssignedLabel.create({
                            LabelId: data.labelId,
                            BoardId: data.boardId,
                            CardId: data.cardId
                        })
                    } else {
                        assignment.destroy()
                    }
                    await sendLabels(ws, req.params.boardId)
                }
                break
        }
    })
})

async function sendBoard(ws: WebSocket, board: BoardAttributes) {
    ws.send(JSON.stringify({   // TODO fix ts
        "type": "board",       // @ts-ignore
        "title": board?.title, // @ts-ignore
        "description": board?.description
    }))
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
    ws.send(JSON.stringify({
        "type": "list",
        "id": list.id,
        "title": list.title,
        "position": list.position,
        "boardId": list.BoardId
    }))
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
    ws.send(JSON.stringify({
        "type": "card",
        "id": card.id,
        "boardId": card.BoardId,
        "listId": card.ListId,
        "title": card.title,
        "description": card.description,
        "position": card.position,
        "checklists": card.Checklists
    }))
}

async function sendLabels(ws: WebSocket, boardId: string) {
    let labels = await Label.findAll({
        where: {
            BoardId: boardId
        },
        include: Card
    })
    ws.send(JSON.stringify({"type": "clearAssignedLabels"}))
    for (let label of labels) {
        ws.send(JSON.stringify({
            "type": "label", // @ts-ignore
            "id": label.id, // @ts-ignore
            "boardId": label.boardId, // @ts-ignore
            "title": label.title, // @ts-ignore
            "color": label.color, // @ts-ignore
            "textColor": label.textColor
        })) //@ts-ignore
        let assignments = await AssignedLabel.findAll({
            where: {
                BoardId: boardId, //@ts-ignore
                LabelId: label.id
            }
        })
        for (let assignment of assignments) {
            ws.send(JSON.stringify({
                "type": "assignedLabel", // @ts-ignore
                "labelId": assignment.LabelId, // @ts-ignore
                "boardId": assignment.BoardId, // @ts-ignore
                "cardId": assignment.CardId
            }))
        }
    }
}

app.listen(port, () => {
    console.log(`Running on port ${port}`)
})