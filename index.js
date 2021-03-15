const jsonServer = require('json-server')
const db = require('./db')

const server = jsonServer.create()
const router = jsonServer.router(db())
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)

const PORT = process.env.NODE_ENV === 'production' ? process.env.PORT : '9090';

server.listen(PORT, () => {
  console.log(`Noteful json server started at PORT: ${PORT}`)
})


/*
env variable = data that lives outside your application
Need port from heroku
process.env.PORT || 9090

Deploying to heroku
1.) Start on local server (fixed port)
2.) Use env.PORT to connect to Heroku
 */

// 3/10
// make fresh repo git clone it to new repo
// make a seperate repo for client and server code
// commit changes...push to heroku...heroku-server/notes if error check heroku logs
// should only talk on the browser level through fetches
// set up heroku and push new project