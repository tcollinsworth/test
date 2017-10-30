import test from 'ava'
import { createStream } from 'byline'

import * as log from '../logger'

test('constructor', t => {
  log.createLogger('string').info('string')
  log.createLogger('string').info('string\'s "with" quotes')
  log.createLogger('string').info('string with \ ')
  log.createLogger('Object').info({foo:{bar:'baz'}})
  log.createLogger('undefined').info(undefined)
  log.createLogger('null').info(null)
  log.createLogger('boolean').info(true)
  log.createLogger('integer').info(1)
  log.createLogger('float').info(0.1)
  log.createLogger('function').info(Math.sin)
  log.createLogger('array').info(['a',1,true,null])

  let mySymbol = Symbol('foo')
  log.createLogger('symbol').info(mySymbol)

  log.createLogger('error simple').info(new Error('error'))

  const err = new Error('error')
  err.foo = 'bar'
  err.cause = new Error('cause')
  log.createLogger('error w/cause').info(err)

  log.createLogger('all types').info('test1', true, 1, {foo:'bar'}, null, undefined, Math.sin, mySymbol, ['a', 1], 'test2')
  const logger = log.createLogger('logger')
  t.is('info', logger.getLevel().name)
  logger.info(log.createLogger('logger test'))
  log.setLoggerLevel('logger', 'fatal')
  t.is('fatal', logger.getLevel().name)

  t.pass()
})

test.skip('error', t => {
  let mySymbol = Symbol('foo')
  const logger = log.createLogger('app')
  const timeout = Date.now() + 10000
  let cnt = 0
  while (true) {
    //logger.info('test1', true, 1, {foo:'bar'}, null, undefined, Math.sin, mySymbol, ['a', 1], 'test2') //106384.9
    logger.info(new Error('error')) //2431
    ++cnt
    if (timeout < Date.now()) {
      break
    }
  }
  console.log('#/sec ' + cnt/10)
  t.pass()
})
