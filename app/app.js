import path from 'path'
import express from 'express'
import compression from 'compression'

import health from './middleware/health'
import swagger from './middleware/swagger'

import { clsMgr } from './middleware/cls-mgr'
import testAPI from './middleware/test'

import apiRouter from './api'

const app = express()
export default app

app.set('json spaces', 2)

app.use(compression())
app.use(express.static(path.join(__dirname, '../public')))

app.use(health)
app.use(swagger)

app.use(clsMgr)
// app.use(auth)
app.use('/v1', apiRouter)
app.use('/test', testAPI)
// app.use(error)
