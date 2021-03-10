const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray, makeMaliciousNote } = require('./notes/notes.fixtures')

describe('notes Endpoints', function () {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('notes').truncate())

  afterEach('cleanup', () => db('notes').truncate())

  describe(`GET /notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()

      beforeEach('insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })

      it('responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testNotes)
      })
    })

    context(`Given an XSS attack note`, () => {
      const { maliciousNote, expectedNote } = makeMaliciousNote()

      beforeEach('insert malicious note', () => {
        return db
          .into('notes')
          .insert([maliciousNote])
      })
      it('removes XSS attack id', () => {

        return supertest(app)
          .get(`/api/notes`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].id).to.eql(expectedNote.id)
            expect(res.body[0].name).to.eql(expectedNote.name)
          })
      })
    })
  })

  describe(`GET /notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `note doesn't exist` } })
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()

      beforeEach('insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })

      it('responds with 200 and the specified note', () => {
        const noteId = 2
        const expectedNote = testNotes[noteId - 1]
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(200, expectedNote)
      })
    })

    context(`Given an XSS attack note`, () => {
      const { maliciousNote: maliciousNote, expectedNote: expectedNote } = makeMaliciousNote()

      beforeEach('insert malicious note', () => {
        return db
          .into('notes')
          .insert([maliciousNote])
      })
      it('removes XSS attack id', () => {

        return supertest(app)
          .get(`/api/notes/${maliciousNote.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.id).to.eql(expectedNote.id)
            expect(res.body.name).to.eql(expectedNote.name)
          })
      })
    })
  })

  describe(`POST /notes`, () => {
    it(`creates an note, responding with 201 and the new note`, function () {
      this.retries(3)
      const newNote = {
        "id": "cbc787a0-ffaf-11e8-8eb2-f2801f1b9fd1",
        "name": "Dogs",
        "modified": "2019-01-03T00:00:00.000Z",
        "noteId": "b0715efe-ffaf-11e8-8eb2-f2801f1b9fd1",
        "content": "Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui. Velit ex animi reiciendis quasi. Suscipit totam delectus ut voluptas aut qui rerum. Non veniam eius molestiae rerum quam.\n \rUnde qui aperiam praesentium alias. Aut temporibus id quidem recusandae voluptatem ut eum. Consequatur asperiores et in quisquam corporis maxime dolorem soluta. Et officiis id est quia sunt qui iste reiciendis saepe. Ut aut doloribus minus non nisi vel corporis. Veritatis mollitia et molestias voluptas neque aspernatur reprehenderit.\n \rMaxime aut reprehenderit mollitia quia eos sit fugiat exercitationem. Minima dolore soluta. Quidem fuga ut sit voluptas nihil sunt aliquam dignissimos. Ex autem nemo quisquam voluptas consequuntur et necessitatibus minima velit. Consequatur quia quis tempora minima. Aut qui dolor et dignissimos ut repellat quas ad."
      }
      // process.on('uncaughtException', unhandledExceptionCallback);
      return supertest(app)
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newNote.name)
          expect(res.body.id).to.eql(newNote.id)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/notes/${res.body.id}`)
          const expected = new Date().toLocaleString()
          const actual = new Date(res.body.date_published).toLocaleString()
          expect(actual).to.eql(expected)
        })
        .then(res =>
          supertest(app)
            .get(`/api/notes/${res.body.id}`)
            .expect(res.body)
        )
    })
    const requiredFields = ['id', 'name', 'modified', 'noteId', 'content' ]


    requiredFields.forEach(field => {
      const newNote = {
        "name": "Dogs",
        "content": "Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui. Velit ex animi reiciendis quasi. Suscipit totam delectus ut voluptas aut qui rerum. Non veniam eius molestiae rerum quam.\n \rUnde qui aperiam praesentium alias. Aut temporibus id quidem recusandae voluptatem ut eum. Consequatur asperiores et in quisquam corporis maxime dolorem soluta. Et officiis id est quia sunt qui iste reiciendis saepe. Ut aut doloribus minus non nisi vel corporis. Veritatis mollitia et molestias voluptas neque aspernatur reprehenderit.\n \rMaxime aut reprehenderit mollitia quia eos sit fugiat exercitationem. Minima dolore soluta. Quidem fuga ut sit voluptas nihil sunt aliquam dignissimos. Ex autem nemo quisquam voluptas consequuntur et necessitatibus minima velit. Consequatur quia quis tempora minima. Aut qui dolor et dignissimos ut repellat quas ad."
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newNote[field]
        return supertest(app)
          .post('/api/notes')
          .send(newNote)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
    it('removes XSS attack id from response', () => {

      const { maliciousnote, expectednote } = makeMaliciousNote()
      // process.on('uncaughtException', unhandledExceptionCallback);
      // https://stackoverflow.com/questions/34699457/how-do-i-get-the-actual-server-error-when-running-supertest-in-mocha
      return supertest(app)
        .post(`/api/notes`)
        .send(maliciousnote)
        .expect(201)
        .expect(res => {
          expect(res.body.id).to.eql(expectednote.id)
          expect(res.body.name).to.eql(expectednote.name)
          expect(res.body.modified).to.eql(expectednote.modified)
          expect(res.body.noteId).to.eql(expectednote.noteId)
          expect(res.body.content).to.eql(expectednote.content)
        })
    })
  })

  describe(`DELETE /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 12345
        return supertest(app)
          .delete(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `note doesn't exist` } })
      })
      context('Given there are notes in the database', () => {
        const testnotes = makeNotesArray()

        beforeEach('insert notes', () => {
          return db
            .into('notes')
            .insert(testnotes)
        })

        it('responds with 204 and removes the note', () => {
          const idToRemove = 2
          const expectednotes = testnotes.filter(note => note.id !== idToRemove)
          return supertest(app)
            .delete(`/api/notes/${idToRemove}`)
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/notes`)
                .expect(expectednotes)
            )
        })
      })
    })

    describe(`PATCH /api/notes/:note_id`, () => {
      context(`Given no notes`, () => {
        it(`responds with 404`, () => {
          const NoteId = 123456
          return supertest(app)
            .delete(`/api/notes/${NoteId}`)
            .expect(404, { error: { message: `note doesn't exist` } })
        })
      })

      context('Given there are notes in the database', () => {
        const testnotes = makeNotesArray()

        beforeEach('insert notes', () => {
          return db
            .into('notes')
            .insert(testnotes)
        })

        it('responds with 204 and updates the note', () => {
          const idToUpdate = 2
          const updateNote = {
            "id": "cbc787a0-ffaf-11e8-8eb2-f2801f1b9fd1",
            "name": "Dogs",
            "modified": "2019-01-03T00:00:00.000Z",
            "noteId": "b0715efe-ffaf-11e8-8eb2-f2801f1b9fd1",
            "content": "Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui. Velit ex animi reiciendis quasi. Suscipit totam delectus ut voluptas aut qui rerum. Non veniam eius molestiae rerum quam.\n \rUnde qui aperiam praesentium alias. Aut temporibus id quidem recusandae voluptatem ut eum. Consequatur asperiores et in quisquam corporis maxime dolorem soluta. Et officiis id est quia sunt qui iste reiciendis saepe. Ut aut doloribus minus non nisi vel corporis. Veritatis mollitia et molestias voluptas neque aspernatur reprehenderit.\n \rMaxime aut reprehenderit mollitia quia eos sit fugiat exercitationem. Minima dolore soluta. Quidem fuga ut sit voluptas nihil sunt aliquam dignissimos. Ex autem nemo quisquam voluptas consequuntur et necessitatibus minima velit. Consequatur quia quis tempora minima. Aut qui dolor et dignissimos ut repellat quas ad."
          },
          const expectedNote = {
            ...testnotes[idToUpdate - 1],
            ...updateNote
          }
          return supertest(app)
            .patch(`/api/notes/${idToUpdate}`)
            .send(updateNote)
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/notes/${idToUpdate}`)
                .expect(expectedNote)
            )
        })

        it(`responds with 400 when no required fields supplied`, () => {
          const idToUpdate = 2
          return supertest(app)
            .patch(`/api/notes/${idToUpdate}`)
            .send({ irrelevantField: 'foo' })
            .expect(400, {
              error: {
                message: `Request body must have a 'name'`
              }
            })
        })

        it(`responds with 204 when updating only a subset of fields`, () => {
          const idToUpdate = 2
          const updateNote = {
            name: 'updated note name',
          }
          const expectedNote = {
            ...testnotes[idToUpdate - 1],
            ...updateNote
          }

          return supertest(app)
            .patch(`/api/notes/${idToUpdate}`)
            .send({
              ...updateNote,
              fieldToIgnore: 'should not be in GET response'
            })
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/notes/${idToUpdate}`)
                .expect(expectedNote)
            )
        })
      })
    })
  })
})