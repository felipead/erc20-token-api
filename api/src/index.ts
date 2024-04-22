import * as config from './config.js'

// -- Connect to geth and make some sample queries -------------------------

import { buildToken, fetchBalanceOf, fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from './blockchains/erc20/index.js'

console.log(`Connecting to geth at ${config.ETHEREUM_BLOCKCHAIN_ENDPOINT}`)

const token = buildToken('0x0000000000000000000000000000000000001111')

console.log(`Fetching token details...`)
console.log(`Token name: ${await fetchTokenName(token)}`)
console.log(`Token symbol: ${await fetchTokenSymbol(token)}`)
console.log(`Token decimals: ${await fetchTokenDecimals(token)}`)
console.log(`Address [1] balance: ${await fetchBalanceOf(token, '0x50182c9e2756Fc816939869c8F16329085F7369e')}`)
console.log(`Address [2] balance: ${await fetchBalanceOf(token,'0xF0BfC9C28f5a2E3D859E634D5B37d0e3b8E272A9')}`)

// -- GRAPHQL Server -------------------------------------------------------

import express from 'express'
import { createHandler } from 'graphql-http/lib/use/express'

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
