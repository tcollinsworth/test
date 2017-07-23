import express from 'express'
import bodyParser from 'body-parser'

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({
  extended: true, // required to parse json arrays
}))

// Add app routes

export default router
