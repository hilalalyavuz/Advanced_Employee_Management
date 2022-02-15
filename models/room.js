const {DataTypes, Sequelize} = require('sequelize');

const RoomSchema = (sequlize, type) => sequlize.define('Room', {
    Id: {
        type: type.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    CompanyId: {
        type: type.INTEGER,
        allowNull: false
    },
    Name: {
        type: type.STRING,
        allowNull: false
    },
    Capacity: {
        type: type.INTEGER,
        allowNull: false
    },
    IsDeleted: {
        type: type.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
},{
    createdAt:false,
    freezeTableName: true,
    updatedAt: false,
});

module.exports = RoomSchema;