function applyExtraSetup(sequelize) {
  const {Auth, User, House, HouseUser, Task, Record} = sequelize.models;

  House.hasMany(HouseUser, {as: 'Roommates'})
  House.hasMany(Task, {as: 'Tasks'})

  User.hasOne(Auth, {as: 'Auth'})

  Task.hasOne(HouseUser, {as: 'Active'})
  Task.hasMany(Record, {as: 'Records'})

  Record.hasOne(HouseUser, {as: 'houseUser'})

  HouseUser.hasOne(User, {as: 'User', foreignKey: 'UserId'})
}

module.exports = {
  applyExtraSetup
}