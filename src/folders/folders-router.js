const path = require('path')
const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.name)
})

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(serializeFolder))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { id, folderName } = req.body
    const newFolder = { id, folderName }

    for (const [key, value] of Object.entries(newFolder)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    FoldersService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder)) //returning from endpoint 'data' in App.js
      })
      .catch(next)
  })

foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    FoldersService.getById(
      req.app.get('db'),
      req.params.user_id
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.folder))
  })
  // .delete((req, res, next) => {
  //   FoldersService.deleteFolders(
  //     req.app.get('db'),
  //     req.params.folder_id
  //   )
  //     .then(numRowsAffected => {
  //       res.status(204).end()
  //     })
  //     .catch(next)
  // })
  // .patch(jsonParser, (req, res, next) => {
  //   const { id, folderName } = req.body
  //   const folderToUpdate = { id, folderName }

  //   const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length
  //   if (numberOfValues === 0)
  //     return res.status(400).json({
  //       error: {
  //         message: `Request body must contain a folder name'`
  //       }
  //     })

  //   FoldersService.updateFolders(
  //     req.app.get('db'),
  //     req.params.folder_id,
  //     folderToUpdate
  //   )
  //     .then(numRowsAffected => {
  //       res.status(204).end()
  //     })
  //     .catch(next)
  // })

module.exports = foldersRouter