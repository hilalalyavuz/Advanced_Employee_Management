const {DataTypes, Sequelize} = require('sequelize');

const SeatSchema = (sequlize, type) => sequlize.define('Seat', {
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
    IsDeleted: {
        type: type.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    Count: {
        type: type.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
},{
    createdAt:false,
    freezeTableName: true,
    updatedAt: false,
});

module.exports = SeatSchema;