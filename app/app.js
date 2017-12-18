import path from 'path'
import express from 'express'
import compression from 'compression'

import health from './middleware/health'
import swagger from './middleware/swagger'

import { clsMgr, set as clsSet } from './middleware/cls-mgr'
import testAPI from './middleware/test'

import apiRouter from './api'

import expressLogger from './logger-cls/express-logger'
//TODO setup header copy to axios
//TODO setup req log route filtering API
//TODO setup logger config API

const app = express()
export default app

app.set('json spaces', 2)

app.use(clsMgr) //TODO set into expressLogger and axios

app.use(expressLogger)

app.use(compression())
app.use(express.static(path.join(__dirname, '../public')))

app.use(health)
app.use(swagger)

// app.use(auth) //TODO for auth routes, proxy through auth method
app.use('/v1', apiRouter)
app.use('/test', testAPI)

//TODO central error handlers for each error type, last for any uncaught
app.use((err, req, res, next) => {
  console.log('express error handler', err)
  //TODO handle or next(err)
  clsSet('reqError', err)
  res.send('Error ' + err.message)
})
