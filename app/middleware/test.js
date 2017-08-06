import express from 'express'
import wrap from 'express-async-wrap'

import * as sessionMgr from './sessionMgr'

const router = new express.Router()

router.get('/', wrap(test))

async function test(req, res) {
  console.log('test ' + sessionMgr.get('reqId'))

  //demonstrates CLS works with async await 
  const reqId = await asyncTest()
  console.log(`await reqId ${reqId}`)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('timedout reqId ' + sessionMgr.get('reqId'))
      resolve({resp: 'fubar'})
    }, 2000)
  })
  .then((resp) => {
    res.json({resp})
  })
}

async function asyncTest() {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('asyncTest executed')
      resolve(getReqId())
    }, 3000)
  })
}

function getReqId() {
  console.log('getReqId executed')
  return sessionMgr.get('reqId')
}

export default router
