export const fatal = {
  name: 'fatal',
  value: 60
}

export const error = {
  name: 'error',
  value: 50
}

export const warn = {
  name: 'warn',
  value: 40
}

export const info = {
  name: 'info',
  value: 30
}

export const debug = {
  name: 'debug',
  value: 20
}

export const trace = {
  name: 'trace',
  value: 10
}

export function getLevel(level) {
  switch (level) {
    case 'fatal':
      return fatal
    case 'error':
      return error
    case 'warn':
      return warn
    case 'info':
      return info
    case 'debug':
      return debug
    case 'trace':
      return trace
    default:
      throw new Error('unrecognized level ' + level)
  }
}
