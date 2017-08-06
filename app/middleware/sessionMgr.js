import express from 'express'

//CLS does not currently work with async / await
import { createNamespace } from 'continuation-local-storage'

import uuidV4 from 'uuidv4'

//https://datahero.com/blog/2014/05/22/node-js-preserving-data-across-async-callbacks/
//http://asim-malik.com/the-perils-of-node-continuation-local-storage/
//https://github.com/othiym23/node-continuation-local-storage/issues/98
//https://github.com/jeff-lewis/cls-hooked
const sessionNS = createNamespace('sessionNamespace')

function sessionMiddleware(req, res, next) {
  sessionNS.run(() => {
    sessionNS.bindEmitter(req)
    sessionNS.bindEmitter(res)

    const reqId = req.header('x-request-id') || uuidV4()
    res.setHeader('x-request-id', reqId)
    sessionNS.set('reqId', reqId)
    console.log('\r\nreqId ' + sessionNS.get('reqId'))
    next()
  })
}

function set(key, value) {
  sessionNS.set(key, value)
}

function get(key) {
  return sessionNS.get(key)
}

export {
  sessionMiddleware,
  set,
  get
}
