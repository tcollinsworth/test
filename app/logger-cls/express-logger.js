import * as log from './logger'
import { fatal, error, warn, debug, info, trace, getLevel } from './levels'
import * as serializers from './express-serializers'

const defaultOpts = {
  level: 'info'
}

//TODO is a constructor right
class Logger {
  constructor(name, options = defaultOpts, stream = process.stdout) {
    //TODO FIXME this.logger = log.createLogger(name, options, stream)

  }
}

//TODO return middleware function

this.reqSerializers = serializers.defaultReqSerializers
this.resSerializers = serializers.defaultResSerializers

reqLog() {

}

resLog() {

}
