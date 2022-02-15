const Sequelize = require('sequelize');
const UserModel = require('../models/user');
const RoleModel = require('../models/role');
const UserRoleModel = require('../models/userRole');
const CompanyModel = require('../models/company');
const RoomModel = require('../models/room');
const SeatModel = require('../models/seat');
const ReservationModel = require('../models/reservation');




const SQL_HOST = '127.0.0.1'
const SQL_USERNAME = 'root'
const SQL_PWD = 'root'
const SQL_DB = 'OfficeReservation'
const SQL_PORT = "8889"
const SQL_SOCKETPATH= '/Applications/MAMP/tmp/mysql/mysql.sock'
const SQL_INSTANCE = ""
const SQL_TYPE = 'mysql'

const sequelize = new Sequelize(SQL_DB, SQL_USERNAME, SQL_PWD, {
    host: SQL_HOST,
    port: SQL_PORT,
    logging: console.log,
    dialect: SQL_TYPE,
    dialectOptions:{
        supportBigNumbers: true,
    },
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    retry: {
        match: [/Deadlock/i],
        max: 3
    }
});

const User = UserModel(sequelize, Sequelize);
const Role = RoleModel(sequelize, Sequelize);
const UserRole = UserRoleModel(sequelize, Sequelize);
const Company = CompanyModel(sequelize,Sequelize);
const Room = RoomModel(sequelize, Sequelize);
const Seat = SeatModel(sequelize, Sequelize);
const Reservation = ReservationModel(sequelize, Sequelize);

const Models = {
    User,
    Role,
    UserRole,
    Company,
    Room,
    Seat,
    Reservation,
};


const connection = {};

module.exports = async(includeSequelize) => {
    // PK FK define parts
    Models.Role.hasMany(Models.UserRole, {foreignKey: 'RoleId'});
    Models.UserRole.belongsTo(Models.Role,{foreignKey: 'RoleId'});

    Models.User.hasMany(Models.UserRole, {foreignKey: 'UserId'});
    Models.UserRole.belongsTo(Models.User,{foreignKey: 'UserId'});

    Models.Company.hasMany(Models.User, {foreignKey: 'CompanyId'});
    Models.User.belongsTo(Models.Company,{foreignKey: 'CompanyId'});

    Models.Company.hasMany(Models.Room, {foreignKey: 'CompanyId'});
    Models.Room.belongsTo(Models.Company,{foreignKey: 'CompanyId'});

    Models.Company.hasMany(Models.Seat, {foreignKey: 'CompanyId'});
    Models.Seat.belongsTo(Models.Company,{foreignKey: 'CompanyId'});

    Models.User.hasMany(Models.Reservation, {foreignKey: 'user_id'});
    Models.Reservation.belongsTo(Models.User,{foreignKey: 'user_id'});

    Models.Room.hasMany(Models.Reservation, {foreignKey: 'room_id'});
    Models.Reservation.belongsTo(Models.Room,{foreignKey: 'room_id'});

    Models.Seat.hasMany(Models.Reservation, {foreignKey: 'seat_id'});
    Models.Reservation.belongsTo(Models.Seat,{foreignKey: 'seat_id'});



    // End of PK FK define parts
    if(includeSequelize){
        Models["sequelize"] = sequelize;
    }
    

    if(connection.isConnected){
        console.log(' USING EXISTING CONNECTION.');
        return Models;
    }
    const result = await sequelize.authenticate();
    connection.isConnected = true;
    console.log("CREATED A NEW CONNECTION.");

    return Models;
};