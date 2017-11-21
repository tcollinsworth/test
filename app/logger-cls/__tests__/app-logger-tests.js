import test from 'ava'
import { createStream } from 'byline'

import * as log from '../app-logger'

test.skip('get/set level', t => {
  const logger = log.createLogger('fooLogger')
  t.is('info', logger.level)
  logger.level = 'debug'
  t.is('debug', logger.level)
})

test.skip('log', async(t) => {
  const opts = log.getClonedDefaultOpts()
  const bylineStream = createStream()
  opts.stream = bylineStream
  opts.prettyPrintOpts = false
  const logger = log.createLogger('barLogger', opts)

  logger.info('test')
  const logLine = JSON.parse(await getLogLine(bylineStream))
  t.truthy(logLine.pid)
  t.truthy(logLine.hostname)
  t.is('app', logLine.name)
  t.truthy(logLine.level)
  t.truthy(logLine.time)
  t.is('test', logLine.msg)
})

test.skip('error', t => {
  const opts = log.getClonedDefaultOpts()
  opts.prettyPrintOpts = false
  const logger = log.createLogger('bazLogger', opts)

  logger.error('error last', new Error('error mesg')) // prints: error last {}
  logger.error(new Error('error mesg'), 'error first') // prints: error first\r\nError: error mesg\r\nstacktrace
})

async function getLogLine(bylineStream) {
  return new Promise((resolve, reject) => {
    bylineStream.on('data', (line) => {
      resolve(line.toString())
    })
    bylineStream.on('error', (err) => {
      reject(err)
    })
  })
}
