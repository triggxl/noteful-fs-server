// make a db file
// psql noteful... \d
const knex = require('../');

// for local use (DB you created for assignment)
const db = knex({
  client: 'pg',
  connection: process.env.DB_URL || 'postgresql://Triggxl@localhost/noteful' //change to noteful db
})

module.exports = db;

// push to heroku after it works locally
