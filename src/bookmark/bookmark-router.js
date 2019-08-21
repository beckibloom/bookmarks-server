const express = require('express')
const xss = require('xss')
const uuid = require('uuid/v4')
const logger = require('../logger')
const BookmarksService = require('./bookmarks-service')

const bookmarkRouter = express.Router()
const jsonParser = express.json()

bookmarkRouter
  .route('/bookmark')
  .get((req,res) => {
    BookmarksService.getAllBookmarks(
      req.app.get('db')
    )
      .then(bookmarks => {
        // for (let i=0; i<Object.keys(bookmarks).length; i++) {
        //   res.json({
        //     id: bookmarks[i].id,
        //     title: xss(bookmarks[i].title),
        //     url: xss(bookmarks[i].url),
        //     rating: bookmark[i].rating,
        //     desc: xss(bookmarks[i].desc)
        //   })
        // }
        res
          .status(200)
          .json(bookmarks)
      })
      .catch(next)
  })
  .post(jsonParser, (req,res, next) => {
    const {title,url,rating,desc=""} = req.body
    const requiredFields = {title,url,rating}

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        logger.error(`${key} is required`)
        return res
          .status(400)
          .send('Invalid data')
      }
    }

    const id = uuid();
    const newBookmark = {
      id: id,
      title: xss(title),
      url: xss(url),
      rating: rating,
      desc: xss(desc)
    }

    BookmarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(`/bookmark/${bookmark.id}`)
          .json(bookmarks)
      })
      .catch(next)
  })

bookmarkRouter
  .route('/bookmark/:id')
  .all((req,res,next) => {
    BookmarksService.getById(
      req.app.get('db'),
      req.params.id
    )
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: `Bookmark not found` }
          })
        }
        res.bookmark = bookmark // save the bookmark for the next middleware
        next() // don't forget to call next so the next middleware happens
      })
  })
  .get((req,res) => {
    res.json({
      id: bookmark.id,
      title: xss(bookmark.title),
      url: xss(bookmark.url),
      rating: bookmark.rating,
      desc: xss(bookmark.desc)
    })
  })
  .delete((req,res) => {
    BookmarksService.deleteBookmark(
      req.app.get('db'),
      req.params.id
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = bookmarkRouter