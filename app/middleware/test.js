import express from 'express'
import wrap from 'express-async-wrap'
import delay from 'delay'

import * as clsMgr from './cls-mgr'

const router = new express.Router()
export default router

router.get('/', wrap(test))

async function test(req, res) {
  console.log(`test reqId at start ${clsMgr.get('reqId')} ${new Date().getTime()}`)

  //demonstrates CLS works with async await
  const reqId = await asyncTest()
  console.log(`await reqId ${reqId} ${new Date().getTime()}`)

  //demonstrates CLS works with promise
  const result = await promiseTest()
  console.log(`after execution reqId ${result} ${new Date().getTime()}`)

  res.json({result})
}

async function promiseTest() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`promise setTimeout reqId ${clsMgr.get('reqId')} ${new Date().getTime()}`)
      resolve(clsMgr.get('reqId'))
    }, 2000)
    console.log('after promiseTest setTimeout')
  })
}

async function asyncTest() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getReqId())
    }, 3000)
    console.log('after asyncTest setTimeout')
  })
}

function getReqId() {
  return `await asyncTest setTimeout reqId ${clsMgr.get('reqId')}`
}
