import { serial as test } from 'ava'
import axios from 'axios'
import sinon from 'sinon'
import lodash from 'lodash'

import { ok200, err404, err500, errXXX, errorResp } from '../../lib/axios-test-response-helper/axios-test-response-helper'

import * as c from '../../constants'
import * as a from '../audience-mesg-relay'

const mockGet = sinon.stub(axios, 'get')
const mockPost = sinon.stub(axios, 'post')

let preEnv

test.beforeEach(t => {
  preEnv = lodash.cloneDeep(process.env)
  clearMesgRelayEnvVars()
})

test.afterEach.always(t => {
  process.env = preEnv
  mockGet.reset()
  mockPost.reset()
})

test('failed, retrieving data returns false == don\'t poll immediately', async(t) => {
  const e = process.env

  c.provMesgRelayBatchSize=3
  c.provMesgRelayJwt='someJwtBytes'
  c.provAppUrlPrefix='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='http://lbe.develop.paris-squad.com'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  a.init()

  const data = await a.relay()

  t.is(false, data, 'expected data relayed false')
})

function setMockGet() {
  mockGet.onCall(0).returns(Promise.resolve(ok200({ respBody: [
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a1',
      ts: '2001-01-01T00:00:00.000Z',
      seq: 1,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a1',
    },
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a2',
      ts: '2002-01-01T00:00:00.000Z',
      seq: 2,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a2',
    },
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a3',
      ts: '2003-01-01T00:00:00.000Z',
      seq: 3,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a3',
    },
  ] })))
}

test('happy path', async (t) => {
  setMockGet()
  mockPost.returns(Promise.resolve(ok200()))

  const e = process.env

  c.provMesgRelayBatchSize=3
  c.provAppUrlPrefix='http://provisioning-service:8080'
  c.axiosProvAppConfig.headers.Authorization='Bearer someJwtBytes'
  c.axiosProvAppConfig.baseURL='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='http://lbe.develop.paris-squad.com'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  a.init()

  const data = await a.relay()

  t.is(true, data, 'expected data relayed true')
  t.is('/v1/audience-mesgs?limit=3', mockGet.args[0][0])
  t.is('http://provisioning-service:8080', mockGet.args[0][1].baseURL)
  t.is(60000, mockGet.args[0][1].timeout)
  t.is('Bearer someJwtBytes', mockGet.args[0][1].headers.Authorization)
  t.is(c.axiosProvAppConfig.baseURL, mockPost.args[3][2].baseURL)
})

test('provAppUrlPrefix prefix $$ disables relay', async (t) => {
  setMockGet()
  mockPost.returns(Promise.resolve(ok200()))

  const e = process.env

  c.provMesgRelayBatchSize=3
  c.provAppUrlPrefix='$$http://provisioning-service:8080'
  c.axiosProvAppConfig.headers.Authorization='Bearer someJwtBytes'
  c.axiosProvAppConfig.baseURL='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='http://lbe.develop.paris-squad.com'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  a.init()

  const data = await a.relay()

  t.is(false, data, 'expected data relayed true')
})

test('provAppUrlPrefix undefined disables relay', async (t) => {
  setMockGet()
  mockPost.returns(Promise.resolve(ok200()))

  const e = process.env

  c.provMesgRelayBatchSize=3
  delete c.provAppUrlPrefix
  c.axiosProvAppConfig.headers.Authorization='Bearer someJwtBytes'
  c.axiosProvAppConfig.baseURL='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='http://lbe.develop.paris-squad.com'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  a.init()

  const data = await a.relay()

  t.is(false, data, 'expected data relayed true')
})

test('provAppUrlPrefix == \'UNDEFINED\' disables relay', async (t) => {
  setMockGet()
  mockPost.returns(Promise.resolve(ok200()))

  const e = process.env

  c.provMesgRelayBatchSize=3
  c.provAppUrlPrefix='UNDEFINED'
  c.axiosProvAppConfig.headers.Authorization='Bearer someJwtBytes'
  c.axiosProvAppConfig.baseURL='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='http://lbe.develop.paris-squad.com'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  a.init()

  const data = await a.relay()

  t.is(false, data, 'expected data relayed true')
})

test('dest.lbeAudienceUrlPrefix disables relay', async (t) => {
  setMockGet()
  mockPost.returns(Promise.resolve(ok200()))

  const e = process.env

  c.provMesgRelayBatchSize=3
  c.provAppUrlPrefix='http://provisioning-service:8080'
  c.axiosProvAppConfig.headers.Authorization='Bearer someJwtBytes'
  c.axiosProvAppConfig.baseURL='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='http://lbe.develop.paris-squad.com'
  delete a.dest.lbeAudienceRelayJwt

  a.init()

  const data = await a.relay()

  t.is(false, data, 'expected data relayed true')
})

test('dest.lbeAudienceUrlPrefix prefix $$ disables relay', async (t) => {
  setMockGet()
  mockPost.returns(Promise.resolve(ok200()))

  const e = process.env

  c.provMesgRelayBatchSize=3
  c.provAppUrlPrefix='http://provisioning-service:8080'
  c.axiosProvAppConfig.headers.Authorization='Bearer someJwtBytes'
  c.axiosProvAppConfig.baseURL='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='$$http://lbe.develop.paris-squad.com'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  a.init()

  const data = await a.relay()

  t.is(false, data, 'expected data relayed true')
})

test('dest.lbeAudienceUrlPrefix == \'UNDEFINED\' disables relay', async (t) => {
  setMockGet()
  mockPost.returns(Promise.resolve(ok200()))

  const e = process.env

  c.provMesgRelayBatchSize=3
  c.provAppUrlPrefix='http://provisioning-service:8080'
  c.axiosProvAppConfig.headers.Authorization='Bearer someJwtBytes'
  c.axiosProvAppConfig.baseURL='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='UNDEFINED'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  a.init()

  const data = await a.relay()

  t.is(false, data, 'expected data relayed true')
})

test('dest.lbeAudienceUrlPrefix undefined disables relay', async (t) => {
  setMockGet()
  mockPost.returns(Promise.resolve(ok200()))

  const e = process.env

  c.provMesgRelayBatchSize=3
  c.provAppUrlPrefix='http://provisioning-service:8080'
  c.axiosProvAppConfig.headers.Authorization='Bearer someJwtBytes'
  c.axiosProvAppConfig.baseURL='http://provisioning-service:8080'

  delete a.dest.lbeAudienceUrlPrefix
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  a.init()

  const data = await a.relay()

  t.is(false, data, 'expected data relayed true')
})

test('poll fails', async (t) => {
  mockGet.onCall(0).returns(Promise.reject(err500()))

  const e = process.env
  c.provAppUrlPrefix='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='http://lbe.develop.paris-squad.com'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  const data = await a.relay()

  t.is(false, data, 'expected data relayed false')
})

test('fails relay 1, no response from REST service', async (t) => {
  mockGet.onCall(0).returns(Promise.resolve(ok200({ respBody: [
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a1',
      ts: '2001-01-01T00:00:00.000Z',
      seq: 1,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a1',
    },
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a2',
      ts: '2002-01-01T00:00:00.000Z',
      seq: 2,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a2',
    },
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a3',
      ts: '2003-01-01T00:00:00.000Z',
      seq: 3,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a3',
    },
  ] })))
  mockPost.onCall(1).returns(Promise.reject({}))

  const e = process.env
  c.provAppUrlPrefix='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='http://lbe.develop.paris-squad.com'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  const data = await a.relay()

  t.is(false, data, 'expected data relayed false')
})

test('relay 2 fails', async (t) => {
  mockGet.onCall(0).returns(Promise.resolve(ok200({ respBody: [
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a1',
      ts: '2001-01-01T00:00:00.000Z',
      seq: 1,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a1',
    },
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a2',
      ts: '2002-01-01T00:00:00.000Z',
      seq: 2,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a2',
    },
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a3',
      ts: '2003-01-01T00:00:00.000Z',
      seq: 3,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a3',
    },
  ] })))

  mockPost.onCall(0).returns(Promise.resolve({}))
  mockPost.onCall(1).returns(Promise.reject({}))
  mockPost.onCall(2).returns(Promise.resolve(ok200()))

  const e = process.env
  c.provAppUrlPrefix='http://provisioning-service:8080'
  c.axiosProvAppConfig.baseURL='http://provisioning-service:8080'
  c.axiosProvAppConfig.headers.Authorization='Bearer someJwtBytes'

  a.dest.lbeAudienceUrlPrefix='http://lbe.develop.paris-squad.com'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  c.provMesgRelayBatchSize=3

  const data = await a.relay()

  t.is(false, data, 'expected data relayed false')
  t.is('http://lbe.develop.paris-squad.com', mockPost.args[0][2].baseURL)
  t.is('Bearer lbeJwtBytes', mockPost.args[0][2].headers.Authorization)
  t.is('http://lbe.develop.paris-squad.com', mockPost.args[1][2].baseURL)
  t.is('Bearer lbeJwtBytes', mockPost.args[1][2].headers.Authorization)
  t.is('/v1/audience-mesgs/ack/id/05eab024-0d9d-4122-9af7-415ebc8756a1/seq/1', mockPost.args[2][0])
  t.is('http://provisioning-service:8080', mockPost.args[2][2].baseURL)
  t.is('Bearer someJwtBytes', mockPost.args[2][2].headers.Authorization)
})

test('fails ack', async (t) => {
  mockGet.onCall(0).returns(Promise.resolve(ok200({ respBody: [
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a1',
      ts: '2001-01-01T00:00:00.000Z',
      seq: 1,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a1',
    },
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a2',
      ts: '2002-01-01T00:00:00.000Z',
      seq: 2,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a2',
    },
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a3',
      ts: '2003-01-01T00:00:00.000Z',
      seq: 3,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a3',
    },
  ] })))

  mockPost.onCall(0).returns(Promise.resolve({}))
  mockPost.onCall(1).returns(Promise.resolve({}))
  mockPost.onCall(2).returns(Promise.resolve({}))
  mockPost.onCall(3).returns(Promise.resolve(err404))

  const e = process.env
  c.provAppUrlPrefix='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='http://lbe.develop.paris-squad.com'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  const data = await a.relay()

  t.is(true, data, 'expected data relayed true')
})


test('mesg 2 fails post with 422', async (t) => {
  mockGet.onCall(0).returns(Promise.resolve(ok200({ respBody: [
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a1',
      ts: '2001-01-01T00:00:00.000Z',
      seq: 1,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a1',
    },
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a2',
      ts: '2002-01-01T00:00:00.000Z',
      seq: 2,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a2',
    },
    { id: '05eab024-0d9d-4122-9af7-415ebc8756a3',
      ts: '2003-01-01T00:00:00.000Z',
      seq: 3,
      mesg: {
        name: 'All Users',
        allUsersMatched: true,
      },
      orgId: '05eab024-0d9d-4122-9af7-415ebc8756a3',
    },
  ] })))

  mockPost.onCall(0).returns(Promise.resolve({}))
  mockPost.onCall(1).returns(Promise.reject(errXXX(422,'conflict','')))
  mockPost.onCall(2).returns(Promise.resolve({}))
  mockPost.onCall(3).returns(Promise.resolve({}))

  const e = process.env
  c.provAppUrlPrefix='http://provisioning-service:8080'

  a.dest.lbeAudienceUrlPrefix='http://lbe.develop.paris-squad.com'
  a.dest.lbeAudienceRelayJwt='lbeJwtBytes'

  const data = await a.relay()

  t.is(true, data, 'expected data relayed true')
  t.is('/v1/audience-mesgs/ack/id/05eab024-0d9d-4122-9af7-415ebc8756a2/seq/2', mockPost.args[2][0])
})

function clearMesgRelayEnvVars() {
  const e = process.env

  c.provMesgRelayBatchSize='' //reset default
  c.provAppUrlPrefix=''
  a.dest.lbeAudienceUrlPrefix=''
  a.dest.lbeAudienceRelayJwt=''

  delete e.PROV_MESG_RELAY_BATCH_SIZE
  delete e.PROV_APP_URL_PREFIX
  delete e.KAFKA_CHAN_LP_TOPIC

  delete e.PROV_MESG_RELAY_AUDIT_SRC_URL_PREFIX_UCS
  delete e.PROV_MESG_RELAY_AUDIT_SRC_URL_PATH_UCS
  delete e.PROV_MESG_RELAY_AUDIT_SRC_AUTH_BASIC_UCS
  delete e.PROV_MESG_RELAY_AUDIT_DST_KAFKA_TOPIC_UCS

  delete e.PROV_MESG_RELAY_AUDIT_SRC_URL_PREFIX_CP
  delete e.PROV_MESG_RELAY_AUDIT_SRC_URL_PATH_CP
  delete e.PROV_MESG_RELAY_AUDIT_SRC_AUTH_BASIC_CP
  delete e.PROV_MESG_RELAY_AUDIT_DST_KAFKA_TOPIC_CP

  delete e.PROV_MESG_RELAY_AUDIT_SRC_URL_PREFIX_PROV
  delete e.PROV_MESG_RELAY_AUDIT_SRC_URL_PATH_PROV
  delete e.PROV_MESG_RELAY_AUDIT_SRC_AUTH_JWT_PROV
  delete e.PROV_MESG_RELAY_AUDIT_DST_KAFKA_TOPIC_PROV

  delete e.PROV_BIZAPPS_FULFILLMENT_URL

  delete e.PROV_LBE_AUDIENCE_URL_PREFIX
  delete e.PROV_LBE_AUDIENCE_RELAY_JWT
}
