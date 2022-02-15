const {DataTypes, Sequelize} = require('sequelize');

const ReservationSchema = (sequlize, type) => sequlize.define('reservation', {
    Id: {
        type: type.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    
    user_id: {
        type: type.INTEGER,
        allowNull: false
    },
    room_id: {
        type: type.INTEGER,
        allowNull: true
    },
    seat_id: {
        type: type.INTEGER,
        allowNull: true
    },
    isReserveOrSeat: {
        type: type.STRING,
        allowNull: false
    },
    dateFrom: {
        type: type.DATE,
        allowNull: true
    },
    dateTo: {
        type: type.DATE,
        allowNull: true
    },
    SeatNo: {
        type: type.STRING,
        allowNull: true,
        defaultValue: null,
    },
},{
    createdAt:false,
    freezeTableName: true,
    updatedAt: false,
});

module.exports = ReservationSchema;