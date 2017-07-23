import express from 'express'

import * as sessionMgr from './sessionMgr'

const router = new express.Router()

router.get('/', test)

function test(req, res) {
  console.log('test ' + sessionMgr.get('reqId'))
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('timedout reqId ' + sessionMgr.get('reqId'))
      resolve({resp: 'fubar'})
    }, 2000)
  })
  .then((resp) =>{
    res.json({resp})
  })
}

export default router
