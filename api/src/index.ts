import * as config from './config.js'

// -- Connect to geth and make some sample queries -------------------------

import { Web3 } from 'web3'
import ERC20TokenABI from './erc20/abi.json' assert {type: 'json'}

console.log(`Connecting to geth at ${config.ETHEREUM_BLOCKCHAIN_ENDPOINT}`)

const tokenAddress = '0x0000000000000000000000000000000000001111'
const provider = new Web3.providers.HttpProvider(config.ETHEREUM_BLOCKCHAIN_ENDPOINT)
const web3 = new Web3(provider)
const token = new web3.eth.Contract(ERC20TokenABI, tokenAddress)

console.log(`Fetching token details...`)
console.log(`Token name: ${await token.methods.name().call()}`)
console.log(`Token symbol: ${await token.methods.symbol().call()}`)
console.log(`Token decimals: ${await token.methods.decimals().call()}`)
console.log(`Token total-supply: ${await token.methods.totalSupply().call()}`)
console.log(`Address 0x50182c9e2756Fc816939869c8F16329085F7369e balance: ${await token.methods.balanceOf('0x50182c9e2756Fc816939869c8F16329085F7369e').call()}`)
console.log(`Address 0xF0BfC9C28f5a2E3D859E634D5B37d0e3b8E272A9 balance: ${await token.methods.balanceOf('0xF0BfC9C28f5a2E3D859E634D5B37d0e3b8E272A9').call()}`)

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
