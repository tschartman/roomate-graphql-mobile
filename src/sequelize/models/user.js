const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
 
  const User = sequelize.define('User', {
    nickname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    }
  })

  return User
}