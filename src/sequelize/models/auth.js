const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
  const Auth = sequelize.define('Auth', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      },
      unique: true
    },
    password: DataTypes.STRING
  })

  return Auth
}