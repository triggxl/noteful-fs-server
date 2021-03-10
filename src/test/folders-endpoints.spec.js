const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeMaliciousFolder } = require('./folders/folders.fixtures')

describe('Folders Endpoints', function () {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('folders').truncate())

  afterEach('cleanup', () => db('folders').truncate())

  describe(`GET /folders`, () => {
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
    })

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
      })

      it('responds with 200 and all of the folders', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders)
      })
    })

    context(`Given an XSS attack folder`, () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder()

      beforeEach('insert malicious folder', () => {
        return db
          .into('folders')
          .insert([maliciousFolder])
      })
      it('removes XSS attack id', () => {

        return supertest(app)
          .get(`/api/folders`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].id).to.eql(expectedFolder.id)
            expect(res.body[0].name).to.eql(expectedFolder.name)
          })
      })
    })
  })

  describe(`GET /folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    })

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
      })

      it('responds with 200 and the specified folder', () => {
        const FolderId = 2
        const expectedFolder = testFolders[FolderId - 1]
        return supertest(app)
          .get(`/api/folders/${FolderId}`)
          .expect(200, expectedFolder)
      })
    })

    context(`Given an XSS attack folder`, () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder()

      beforeEach('insert malicious folder', () => {
        return db
          .into('folders')
          .insert([maliciousFolder])
      })
      it('removes XSS attack id', () => {

        return supertest(app)
          .get(`/api/folders/${maliciousFolder.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.id).to.eql(expectedFolder.id)
            expect(res.body.name).to.eql(expectedFolder.name)
          })
      })
    })
  })

  describe(`POST /folders`, () => {
    it(`creates an folder, responding with 201 and the new folder`, function () {
      this.retries(3)
      const newFolder = {
        name: 'Test new folder',
        id: 'Test new folder id...',
      }
      // process.on('uncaughtException', unhandledExceptionCallback);
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newFolder.name)
          expect(res.body.id).to.eql(newFolder.id)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/folders/${res.body.id}`)
          const expected = new Date().toLocaleString()
          const actual = new Date(res.body.date_published).toLocaleString()
          expect(actual).to.eql(expected)
        })
        .then(res =>
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .expect(res.body)
        )
    })
    const requiredFields = [ 'id', 'name']


    requiredFields.forEach(field => {
      const newFolder = {
        name: 'Test new folder',
        id: 'Test new folder id...'
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFolder[field]
        return supertest(app)
          .post('/api/folders')
          .send(newFolder)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
    it('removes XSS attack id from response', () => {

      const { maliciousFolder, expectedFolder } = makeMaliciousFolder()
      // process.on('uncaughtException', unhandledExceptionCallback);
      // https://stackoverflow.com/questions/34699457/how-do-i-get-the-actual-server-error-when-running-supertest-in-mocha
      return supertest(app)
        .post(`/api/folders`)
        .send(maliciousFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.id).to.eql(expectedFolder.id)
          expect(res.body.name).to.eql(expectedFolder.name)
        })
    })
  })

  describe(`DELETE /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 12345
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
      context('Given there are folders in the database', () => {
        const testfolders = makeFoldersArray()

        beforeEach('insert folders', () => {
          return db
            .into('folders')
            .insert(testfolders)
        })

        it('responds with 204 and removes the folder', () => {
          const idToRemove = 2
          const expectedfolders = testfolders.filter(folder => folder.id !== idToRemove)
          return supertest(app)
            .delete(`/api/folders/${idToRemove}`)
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/folders`)
                .expect(expectedfolders)
            )
        })
      })
    })

    describe(`PATCH /api/folders/:folder_id`, () => {
      context(`Given no folders`, () => {
        it(`responds with 404`, () => {
          const FolderId = 123456
          return supertest(app)
            .delete(`/api/folders/${FolderId}`)
            .expect(404, { error: { message: `Folder doesn't exist` } })
        })
      })

      context('Given there are folders in the database', () => {
        const testfolders = makeFoldersArray()

        beforeEach('insert folders', () => {
          return db
            .into('folders')
            .insert(testfolders)
        })

        it('responds with 204 and updates the folder', () => {
          const idToUpdate = 2
          const updateFolder = {
            id: 'updated folder id',
            name: 'updated folder name',
          }
          const expectedFolder = {
            ...testfolders[idToUpdate - 1],
            ...updateFolder
          }
          return supertest(app)
            .patch(`/api/folders/${idToUpdate}`)
            .send(updateFolder)
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/folders/${idToUpdate}`)
                .expect(expectedFolder)
            )
        })

        it(`responds with 400 when no required fields supplied`, () => {
          const idToUpdate = 2
          return supertest(app)
            .patch(`/api/folders/${idToUpdate}`)
            .send({ irrelevantField: 'foo' })
            .expect(400, {
              error: {
                 message: `Request body must have a 'name'`
              }
            })
        })

        it(`responds with 204 when updating only a subset of fields`, () => {
          const idToUpdate = 2
          const updateFolder = {
            name: 'updated folder name',
          }
          const expectedFolder = {
            ...testfolders[idToUpdate - 1],
            ...updateFolder
          }

          return supertest(app)
            .patch(`/api/folders/${idToUpdate}`)
            .send({
              ...updateFolder,
              fieldToIgnore: 'should not be in GET response'
            })
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/folders/${idToUpdate}`)
                .expect(expectedFolder)
            )
        })
      })
    })
  })
})