const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HouseUser = sequelize.define('HouseUser', {
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return HouseUser;
}