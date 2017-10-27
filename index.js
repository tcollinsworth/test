import 'babel-polyfill'
import app from './app/app'

import { NODE_ENV, NODE_HOST, NODE_PORT } from './config'

app.listen(NODE_PORT, NODE_HOST, () => {
  process.stdout.write(`Node is listening on ${NODE_HOST}:${NODE_PORT}, mode ${NODE_ENV}`)
})
.on('error', (err) => {
  process.stdout.write(`Error ${err}`)
  return -1
})
