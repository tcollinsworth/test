import express from 'express'

import * as sessionMgr from './sessionMgr'

const router = new express.Router()

router.get('/', test)

function test(req, res) {
  console.log('test ' + sessionMgr.get('reqId'))
  res.json({})
}

export default router
