export const NODE_ENV = process.env.NODE_ENV || 'development'
export const NODE_HOST = process.env.NODE_HOST || 'localhost'
export const NODE_PORT = process.env.NODE_PORT || 3000

// Used by swagger
export const serviceName = 'Starter Service'
export const serviceVersion = '1.0.0'
export const serviceDescription = 'Example of a full featured node.js app with auth, db, etc.'
export const serviceApis = [
  './app/health/health.js',
]
