const {DataTypes, Sequelize} = require('sequelize');

const UserRoleSchema = (sequlize, type) => sequlize.define('UserRole', {
    Id: {
        type: type.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    UserId: {
        type: type.INTEGER,
        allowNull: false
    },
    RoleId: {
        type: type.INTEGER,
        allowNull: false,
    }
},{
    createdAt:false,
    freezeTableName: true,
    updatedAt: false,
});

module.exports = UserRoleSchema;