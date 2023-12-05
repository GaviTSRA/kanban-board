import { DataTypes, ModelDefined, Optional, Sequelize } from 'sequelize';
import express from "express"
import expressWs from "express-ws"
import cors from "cors"
import WebSocket from "ws"
import bodyParser from 'body-parser';

const sequelize = new Sequelize('postgres://postgres:password@192.168.60.106:5432/template1', {
})

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

interface BoardAttributes {
    id: string,
    title: string,
    description: string
}
type BoardCreationAttributes = Optional<BoardAttributes, "id" |"description">
const Board: ModelDefined<BoardAttributes, BoardCreationAttributes> = sequelize.define("Board", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    }
})
const List = sequelize.define("List", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
})
const Card = sequelize.define("Card", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    }
})
Board.hasMany(List)
List.belongsTo(Board)
List.hasMany(Card)
Card.belongsTo(Board)
Card.belongsTo(List)
await sequelize.sync({ alter: true })

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
    board.destroy()
    res.sendStatus(200)
})

 app.ws("/board/:boardId", async (ws, req) => {
    let board = await Board.findByPk(req.params.boardId)
    if (board == null) {
        ws.close()
        return
    }

    ws.send(JSON.stringify({   // TODO
        "type": "board",       // @ts-ignore
        "title": board?.title, // @ts-ignore
        "description": board?.description
    }))

    ws.on("message", msg => {
        const data = JSON.parse(msg.toString())

        switch (data.action) {
            case "updateBoard":
                if (req.body.id != req.params.boardId) return
                if (req.body.title) {
                    board?.set({
                        title: req.body.title
                    })
                }
                if (req.body.description) {
                    board?.set({
                        description: req.body.description
                    })
                }
                break
            case "updateList":

                break
            case "updateCard":

                break
        }
    })
 })

app.listen(port, () => {
    console.log(`Running on port ${port}`)
})