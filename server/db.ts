import { DataTypes, ModelDefined, Optional, Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgres://postgres:password@192.168.60.106:5432/template1', {
    logging: () => {}
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
const AssignedLabel = sequelize.define("AssignedLabel", {})

const Checklist = sequelize.define("Checklist", {
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
        defaultValue: ""
    }
})
const ChecklistItem = sequelize.define("ChecklistItem", {
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
        defaultValue: ""
    },
    checked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
})

const InfoItem = sequelize.define("InfoItem", {
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
    content: {
        type: DataTypes.TEXT
    },
    images: {
        type: DataTypes.TEXT
    }
})

Board.hasMany(List)
Board.hasMany(Label)
Board.hasMany(InfoItem)

List.belongsTo(Board)
List.hasMany(Card)

Card.belongsTo(Board)
Card.belongsTo(List)
Card.belongsTo(Card) //sub cards
Card.hasMany(Label)
Card.hasMany(Checklist)
Card.belongsToMany(Label, { through: AssignedLabel})

Label.belongsTo(Board)
Label.belongsToMany(Card, {through: AssignedLabel})

AssignedLabel.belongsTo(Board)

Checklist.belongsTo(Card)
Checklist.hasMany(ChecklistItem)

ChecklistItem.belongsTo(Checklist)

InfoItem.belongsTo(Board)

await sequelize.sync({ alter: true })

export {
    sequelize,
    Board,
    List,
    Card,
    BoardAttributes,
    Label,
    AssignedLabel,
    Checklist,
    ChecklistItem,
    InfoItem
}