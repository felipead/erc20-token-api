import express from 'express'
import { createHandler } from 'graphql-http/lib/use/express'

import * as config from './config.js'
import { API_SCHEMA } from './schema.js'
import { API_RESOLVER } from './api/resolver.js'

const app = express()

app.get('/health', (req, res) => {
    res.status(200).send('{"health": "ok"}')
})

app.all(
    '/graphql',
    createHandler({
        schema: API_SCHEMA,
        rootValue: API_RESOLVER,
    })
)

const server = app.listen(config.GRAPHQL_API_PORT, () => {
    console.info(`running GraphQL API server at port ${config.GRAPHQL_API_PORT}`)
})

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received: closing HTTP server')
    server.close(() => {
        console.info('server shutdown')
    })
})
