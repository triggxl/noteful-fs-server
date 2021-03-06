const db = require('./src/db')
const express = require('express')
const noteRouter = require('./src/notes/notes-router')
const folderRouter = require('./src/folders/folders-router')
const cors = require('cors');

//require express
const app = express(db);

let corsConfig = {
  options: PORT === 'dev' ? 9090 : 'https://noteful-react-app-6fb0knbsp-triggxl.vercel.app/',
}
// allow requests from 9090 in dev else vercel when live
// express cors middleware
app.use(cors(corsConfig))
// server.use(middlewares)
// server.use(router)

// use
app.use(noteRouter)
app.use(folderRouter)

app.get('/', (req, res) => {
  res.send('Hello Express!');
});

const PORT = process.env.NODE_ENV === 'production' ? process.env.PORT : '9090';

app.listen(PORT, () => {
  console.log(`Noteful json server started at PORT: ${PORT}`)
})


/*
env variable = data that lives outside your application
Need port from heroku
process.env.PORT || 9090

Deploying to heroku
1.) Start on local server (fixed port)
2.) Use env.PORT to connect to Heroku
3.) commit to GitHub
4.) git push heroku
 */

// 3/10
// make fresh repo git clone it to new repo
// make a seperate repo for client and server code
// commit changes...push to heroku...heroku-server/notes if error check heroku logs
// should only talk on the browser level through fetches
// set up heroku and push new project