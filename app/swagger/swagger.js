import swaggerJSDoc from 'swagger-jsdoc'
import express from 'express'

import { serviceName, serviceVersion, serviceDescription, serviceApis } from '../../constants'

const app = new express.Router()

const options = {
  swaggerDefinition: {
    info: {
      title: serviceName,
      version: serviceVersion,
      description: serviceDescription,
    },
    basePath: '/',
  },
  apis: serviceApis,
}

const swaggerSpec = swaggerJSDoc(options)

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.send(swaggerSpec)
})

export default app
