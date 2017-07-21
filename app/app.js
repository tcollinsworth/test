import path from 'path'
import express from 'express'
import compression from 'compression'

import health from './health/health'
import swagger from './swagger/swagger'

const app = express()

app.set('json spaces', 2)

app.use(compression())
app.use(express.static(path.join(__dirname, '../public')))
app.use(health)
app.use(swagger)

export default app
