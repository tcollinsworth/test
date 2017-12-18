import pino from 'pino'
import axios from 'axios'
import uuidV4 from 'uuid/v4'

import { ProvisioningError } from '../middlewares/provisioning-error'
import { provMesgRelayBatchSize, provAppUrlPrefix, axiosProvAppConfig, LOG_LEVEL } from '../constants'
import mapHttpResponse from '../lib/serializer'

const log = pino({ name: 'audience-relay', level: LOG_LEVEL })

const dest = {}
dest.lbeAudienceUrlPrefix = process.env.PROV_LBE_AUDIENCE_URL_PREFIX // || 'http://lbe.develop.paris-squad.com/v1/hooks/organizations/0f337a00-f876-11e6-9767-9318e3776ec3/audiences'
dest.lbeAudienceRelayJwt = process.env.PROV_LBE_AUDIENCE_RELAY_JWT

let pollPath

function init() {
  pollPath = `/v1/audience-mesgs${provMesgRelayBatchSize ? `?limit=${provMesgRelayBatchSize}` : ''}`
}

async function postAudienceMesg(orgId, data) {
  log.debug(data)
  return axios.post(`/v1/hooks/organizations/${orgId}/audiences`, data, {
    baseURL: dest.lbeAudienceUrlPrefix,
    timeout: 60000,
    headers: {
      Authorization: `Bearer ${dest.lbeAudienceRelayJwt}`,
      'x-request-id': uuidV4(),
    },
  })
  .then((response) => {
    if (response && response.config) {
      log.info(mapHttpResponse(response))
    }
    return response
  })
}

async function relay() {
  try {
    if (!provAppUrlPrefix || provAppUrlPrefix.startsWith('$$') || provAppUrlPrefix === 'UNDEFINED'
        || !dest.lbeAudienceRelayJwt
        || !dest.lbeAudienceUrlPrefix || dest.lbeAudienceUrlPrefix.startsWith('$$')
        || dest.lbeAudienceUrlPrefix === 'UNDEFINED') {
      log.debug('relaying audience messages disabled')
      return false
    }
    log.debug('polling audience messages')

    // call prov-app audience-mesg endpoint to get messages
    let data
    try {
      const res = await axios.get(pollPath, axiosProvAppConfig)
      // .then((response) => {
      //   log.info(mapHttpResponse(response))
      //   return response
      // })

      if (res && res.data && res.data.length > 0) {
        data = res.data
        log.info(`found ${data.length} new orgs/audiences to relay`)
      } else {
        log.debug('no audiences to relay')
        return false
      }
    } catch (err) {
      if (err && err.response && err.response.status === 404) {
        log.debug('no audiences to relay')
        return false
      }
      throw new ProvisioningError('Error accessing audience messages', 500, err)
    }

    // attempt relay to learner backend
    let lastestMesgToAck
    let sendError
    let curMesg
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const d of data) {
        curMesg = d
        // eslint-disable-next-line no-await-in-loop
        await postAudienceMesg(d.orgId, d.mesg)
        log.info(`Succesfully posted create all users audience mesg to LBE for org ${d.orgId}`)
        lastestMesgToAck = d
      }
    } catch (err) {
      log.debug('error posting audience create to LBE')
      // eslint-disable-next-line eqeqeq
      if (err && err.response && err.response.status && parseInt(err.response.status, 10) == 422) {
        log.debug('error posting audience create to LBE status = 422')
        lastestMesgToAck = curMesg
        // queue error to be thrown after attempting to ack any successfully relayed messages, and unrecoverable mesg
        /* eslint-disable-next-line max-len */
        sendError = new ProvisioningError('Audience create could not be relayed due to 422 conflict', err.response.status, err)
      } else {
        log.debug('error posting audience to learner backend')
        // queue error to be thrown after attempting to ack any successfully relayed messages
        sendError = new ProvisioningError('Error posting audience create messages to LBE', 500, err)
      }
    }

    // ack lastestMesgToAck
    try {
      if (lastestMesgToAck) {
        log.debug(`acking audience mesgs seq ${lastestMesgToAck.seq}`)
        await axios.post(`/v1/audience-mesgs/ack/id/${lastestMesgToAck.id}/seq/${lastestMesgToAck.seq}`, '', axiosProvAppConfig)
        // .then((response) => {
        //   if (response && response.config) {
        //     log.info(mapHttpResponse(response))
        //   }
        //   return response
        // })
      }
    } catch (err) {
      if (err && err.response && err.response.status === 404) {
        log.debug('last relayed audience not found during ack back to provisioning-application')
        if (sendError) {
          throw sendError
        }
        // data was found and relayed without error, poll again immediately
        return true
      }
      throw new ProvisioningError('Error acking relay of audiences back to provisioning-application', 500, err)
    }

    if (sendError) {
      throw sendError
    }

    // since no error (so it won't spin) and data was found
    // return true so relay will immediately execute again until all messages relayed
    if (data.length > 0) {
      log.debug('no sendError and data.length > 0, return true poll again immediately')
      return true
    }
    log.debug('no sendError and data.length = 0, return false don\'t poll again immediately')
    return false
  } catch (err) {
    if (err.name && err.name === 'ProvisioningError') {
      log.error(err.sourceError, err)

      // eslint-disable-next-line eqeqeq
      if (parseInt(err.status, 10) == 422) {
        // possibly still more messages to relay, poll again immediately
        log.debug('sendError and err.status == 500, return true poll again immediately')
        return true
      }
    } else {
      log.error(err, 'Error relaying audience messages to learner backend')
    }
    /* eslint-disable-next-line max-len */
    log.debug('sendError = ProvisioningError and err.status != 422 or sendError != ProvisioningError, return false don\'t poll again immediately')
    return false
  }
}

export {
  init,
  relay,
  dest,
}
