const {DataTypes, Sequelize} = require('sequelize');

const UserSchema = (sequlize, type) => sequlize.define('User', {
    Id: {
        type: type.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    Name: {
        type: type.STRING,
        allowNull: false
    },
    Surname: {
        type: type.STRING,
        allowNull: false
    },
    Email: {
        type: type.STRING,
        allowNull: false
    },
    Password: {
        type: type.STRING,
        allowNull: false
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
    EmailConfirmGuid: {
        type: type.STRING,
        allowNull: true,
    },
    ısEmailConfirmed: {
        type: type.BOOLEAN,
        allowNull: true,
    },
    IsVerified: {
        type: type.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
    },
    InQuarantine: {
        type: type.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
    },
    QuarantineEndDate: {
        type: type.DATE,
        allowNull: true
    },
},{
    createdAt:false,
    freezeTableName: true,
    updatedAt: false,
});

module.exports = UserSchema;