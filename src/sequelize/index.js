let Sequelize = require('sequelize');
const { applyExtraSetup } = require('./extra-setup');
const {DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_PORT} = process.env

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql'
})

//sequelize.sync({force: true}).then(() => {console.log("sync complete")})

const modelDefiners = [
  require('./models/user'),
  require('./models/auth'),
  require('./models/house'),
  require('./models/task'),
  require('./models/record'),
  require('./models/houseUser'),
]

for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

applyExtraSetup(sequelize)

module.exports = sequelize;