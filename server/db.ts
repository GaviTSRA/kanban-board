import { DataTypes, ModelDefined, Optional, Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgres://postgres:password@192.168.60.106:5432/template1')

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
type BoardOptionalAttributes = Optional<BoardAttributes, "id" |"description">
const Board: ModelDefined<BoardAttributes, BoardOptionalAttributes> = sequelize.define("Board", {
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
interface ListAttributes {
    id: string,
    title: string,
    position: number,
    BoardId: string
}
type ListOptionalAttributes = Optional<ListAttributes, "id">
const List: ModelDefined<ListAttributes, ListOptionalAttributes> = sequelize.define("List", {
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
    position: {
        type: DataTypes.INTEGER,
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
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})
const Label = sequelize.define("Label", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "New Label"
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#000000"
    },
    textColor: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#FFFFFF"
    }
})
const AssignedLabel = sequelize.define("AssignedLabel", {

})
Board.hasMany(List)
Board.hasMany(Label)
List.belongsTo(Board)
List.hasMany(Card)
Card.belongsTo(Board)
Card.belongsTo(List)
Card.hasMany(Label)
Label.belongsTo(Board)
AssignedLabel.belongsTo(Board)
Card.belongsToMany(Label, { through: AssignedLabel})
Label.belongsToMany(Card, {through: AssignedLabel})
await sequelize.sync({ alter: true })

export {
    sequelize,
    Board,
    List,
    Card,
    BoardAttributes,
    ListAttributes,
    Label,
    AssignedLabel
}