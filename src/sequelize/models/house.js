const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const House = sequelize.define('House', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })

  return House;
}