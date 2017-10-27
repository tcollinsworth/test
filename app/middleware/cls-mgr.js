import express from 'express'

//CLS does not currently work with async / await
import { createNamespace } from 'continuation-local-storage'

import uuidV4 from 'uuidv4'

//https://datahero.com/blog/2014/05/22/node-js-preserving-data-across-async-callbacks/
//http://asim-malik.com/the-perils-of-node-continuation-local-storage/
//https://github.com/othiym23/node-continuation-local-storage/issues/98
//https://github.com/jeff-lewis/cls-hooked
const requestNS = createNamespace('requestNamespace')

export function clsMgr(req, res, next) {
  requestNS.run(() => {
    requestNS.bindEmitter(req)
    requestNS.bindEmitter(res)

    const reqId = req.header('x-request-id') || uuidV4()
    res.setHeader('x-request-id', reqId)
    requestNS.set('reqId', reqId)
    console.log('\r\nreqId ' + requestNS.get('reqId'))
    next()
  })
}

export function set(key, value) {
  requestNS.set(key, value)
}

export function get(key) {
  return requestNS.get(key)
}
