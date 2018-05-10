'use strict';

const Hapi = require('hapi')
const container = require('@arkecosystem/core-container')
const logger = container.resolvePlugin('logger')
const schema = container.resolvePlugin('graphql')
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi')

/**
 * Create a new hapi.js server.
 * @param  {Object} config
 * @return {Hapi.Server}
 */
module.exports = async (config) => {
  if (!config.enabled) {
    return logger.info('Oh snap! GraphQL API not enabled')
  }

  const server = new Hapi.Server({ port: config.port })

  await server.register([require('vision'), require('inert'), require('lout')])

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: config.path,
      graphqlOptions: {
        schema
      },
      route: {
        cors: true
      }
    }
  })

  // console.log(schema)
  await server.register({
    plugin: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: config.path
      }
    }
  })

  try {
    await server.start()

    logger.info(`GraphQL API is available and listening on ${server.info.uri}`)

    return server
  } catch (error) {
    logger.error(error.stack)

    process.exit(1)
  }
}