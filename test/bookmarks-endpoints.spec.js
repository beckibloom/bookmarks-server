const { expect } = require('chai')
const knex = require('knex')
const { TEST_DB_URL, API_KEY } = require('../config')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures.js')

// Was not able to get bookmarks.fixtures.js to work - kept getting error 'makeBookmarksArray' is not a function and could not figure out another work-around
// const bookmarksArray = [
//   {
//     id: 1,
//     title: 'First bookmark title',
//     url: 'www.heresabookmark.com',
//     description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
//     rating: 4
//   },
//   {
//     id: 2,
//     title: 'Second bookmark title',
//     url: 'www.heresasecondbookmark.com',
//     description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
//     rating: 3
//   },
//   {
//     id: 3,
//     title: 'Third bookmark title',
//     url: 'www.heresathirdbookmark.com',
//     description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
//     rating: 1
//   },
//   {
//     id: 4,
//     title: 'Fourth bookmark title',
//     url: 'www.heresafourthbookmark.com',
//     description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
//     rating: 5
//   },
// ]

describe('Bookmarks Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('bookmarks').truncate())

  afterEach('cleanup', () => db('bookmarks').truncate())

  describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${API_KEY}`)
          .expect(200, [])
      })
    })

    context('Given there are bookmarks in the database', () => {
      //changed this code to include bookmarksArray variable rather than using the function from the fixtures file
      const testBookmarks = makeBookmarksArray
  
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })
  
      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${API_KEY}`)
          .expect(200, testBookmarks)
      })
    })
  })

  describe(`GET /bookmarks/:bookmark_id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set('Authorization', `Bearer ${API_KEY}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } })
      })
    })

    context('Given there are bookmarks in the database', () => {
      //changed this code to include bookmarksArray variable rather than using the function from the fixtures file
      const testBookmarks = makeBookmarksArray

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('responds with 200 and the specified bookmark', () => {
        const bookmarkId = 2
        const expectedBookmark = testBookmarks[bookmarkId - 1]
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set('Authorization', `Bearer ${API_KEY}`)
          .expect(200, expectedBookmark)
      })
    })
  })
})