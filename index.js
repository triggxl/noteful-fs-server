const jsonServer = require('json-server')
const db = require('./db')

const server = jsonServer.create()
const router = jsonServer.router(db())
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)

const PORT = process.env.NODE_ENV === 'production' ? process.env.PORT : 'http://localhost:9090';

server.listen(PORT, () => {
  console.log(`Noteful json server started at PORT: ${PORT}`)
})

// 3/10
// make fresh repo git clone it to new repo
// make a seperate repo for client and server code
// commit changes...push to heroku...heroku-server/notes if error check heroku logs
// should only talk on the browser level through fetches
// set up heroku and push new project