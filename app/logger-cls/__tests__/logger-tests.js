import test from 'ava'
import { createStream } from 'byline'
import delay from 'delay'

import * as log from '../logger'

test.only('log', async t => {
  const bylineStream = createStream()
  const logger = log.createLogger('barLogger', undefined, bylineStream)

  const err = new Error('fooError')
  err.func = function() {return "custom function"}
  err.sym = Symbol("foo")
  err.str = 'abc'
  err.nan = NaN
  err.null = null
  err.inf = Infinity
  err.ninf = -Infinity
  err.und = undefined
  err.cause = new Error('errCause')
  err.cause.num = 123
  err.cause.cause = new Error('errCauseCause')
  err.cause.cause.bool = true

  logger.info('test', err.nan, err.null, err.inf, err.ninf, err.und, {foo:'bar'}, err)
  const rawLine = await getLogLine(bylineStream)
  console.log(rawLine)
  console.log('rawLine', JSON.stringify(JSON.parse(rawLine), null, '  '))
  const logLine = JSON.parse(rawLine)
  t.truthy(logLine.time)
  t.truthy(logLine.id)
  t.truthy(logLine.level)
  t.is('barLogger', logLine.logger)
  t.truthy(logLine.pid)
  t.truthy(logLine.host)
  t.deepEqual(['test','NaN',null,'Infinity','-Infinity','undefined',{foo:'bar'}], logLine.mesg)
  t.truthy(logLine.errors)
  t.deepEqual('[Function]', logLine.errors[0].func)
  t.deepEqual('Symbol(foo)', logLine.errors[0].sym)
  t.deepEqual('Error', logLine.errors[0].type)
  t.deepEqual('fooError', logLine.errors[0].mesg)
  t.truthy(logLine.errors[0].stack)
  t.is('abc', logLine.errors[0].str)
  t.is('NaN', logLine.errors[0].nan)
  t.is(null, logLine.errors[0].null)
  t.is('Infinity', logLine.errors[0].inf)
  t.is('-Infinity', logLine.errors[0].ninf)
  t.is('undefined', logLine.errors[0].und)
  t.is('Error', logLine.errors[0].cause.type)
  t.is('errCause', logLine.errors[0].cause.mesg)
  t.is(123, logLine.errors[0].cause.num)
  t.is('Error', logLine.errors[0].cause.cause.type)
  t.is('errCauseCause', logLine.errors[0].cause.cause.mesg)
  t.is(true, logLine.errors[0].cause.cause.bool)
})

// import pino from 'pino'
// const log = pino({ name: 'test', level: 'info' })
//
// test.only('pino', async t => {
//   for (let i=0; i<100000000; i++) {
//     await new Promise((resolve, reject) => {
//       setImmediate(() => {
//         log.info('hello world ' + i)
//         resolve()
//       })
//     })
//   }
// })

test.skip('constructor', async (t) => {
  const logger = log.createLogger('aName')
  logger.streamStatus()
  for (let i=0; i<100; i++) {
    await new Promise((resolve, reject) => {
      setImmediate(() => {
        //console.log('hello world ' + i)
        // logger.error('hello world ' + i, new Error('test'))
        logger.info('hello world ' + i)
        resolve()
      })
    })

  }
  //logger.syncWrite()
  //logger.streamStatus()

  // log.createLogger('string').info('string')
  // log.createLogger('string').info('string\'s "with" quotes')
  // log.createLogger('string').info('string with \ ')
  // log.createLogger('Object').info({foo:{bar:'baz'}})
  // log.createLogger('undefined').info(undefined)
  // log.createLogger('null').info(null)
  // log.createLogger('boolean').info(true)
  // log.createLogger('integer').info(1)
  // log.createLogger('float').info(0.1)
  // log.createLogger('function').info(Math.sin)
  // log.createLogger('array').info(['a',1,true,null])
  //
  // let mySymbol = Symbol('foo')
  // log.createLogger('symbol').info(mySymbol)
  //
  // log.createLogger('error simple').info(new Error('error'))
  //
  // const err = new Error('error')
  // err.foo = 'bar'
  // err.cause = new Error('cause')
  // log.createLogger('error w/cause').info(err)
  //
  // log.createLogger('all types').info('test1', true, 1, {foo:'bar'}, null, undefined, Math.sin, mySymbol, ['a', 1], 'test2')
  // const logger = log.createLogger('logger')
  // t.is('info', logger.getLevel().name)
  // logger.info(log.createLogger('logger test'))
  // log.setLoggerLevel('logger', 'fatal')
  // t.is('fatal', logger.getLevel().name)
  // logger.trace('test')
  // logger.debug('test')
  // logger.info('test')
  // logger.warn('test')
  // logger.error('test')
  // logger.fatal('test')
  // log.setLoggerLevel('logger', 'trace')
  // logger.trace('test')
  // logger.debug('test')
  // logger.info('test')
  // logger.warn('test')
  // logger.error('test')
  // logger.fatal('test')
})

test.skip('error', async(t) => {
  let mySymbol = Symbol('foo')
  const logger = log.createLogger('app')
  const timeout = Date.now() + 10000
  let cnt = 0
  while (true) {
    logger.streamStatus()
  logger.syncWrite('{ \
  "time": "1509410647607",\
  "id": "8344785c-6d6c-4785-9363-057ab053a57a",\
  "level": "error",\
  "logger": "app",\
  "pid": "2390",\
  "host": "asus-troy",\
  "mesg": [\
    "test1",\
    true,\
    1,\
    {\
      "foo": "bar"\
    },\
    null,\
    "undefined",\
    "function sin() { [native code] }",\
    "Symbol(foo)",\
    [\
      "a",\
      1\
    ],\
    "test2"\
  ]\
}\n')
  //  logger.error('test1', true, 1, {foo:'bar'}, null, undefined, Math.sin, mySymbol, ['a', 1], 'test2') //106384.9
    //logger.info(new Error('error')) //2431
    ++cnt
    if (timeout < Date.now()) {
      break
    }
  }
  console.log('#/sec ' + cnt/10)
  //await delay(60000)
  //logger.syncWrite()
  t.pass()
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
