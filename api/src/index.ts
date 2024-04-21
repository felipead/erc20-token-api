// -- Connect to geth and make some sample queries -------------------------

import ERC20TokenABI from './erc20/abi.json' assert { type: 'json' }
import { Web3 } from 'web3'

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

import { join } from 'node:path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import express from 'express'
import { createHandler } from 'graphql-http/lib/use/express'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'

import * as config from './config.js'


const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = loadSchemaSync(join(__dirname, '..', 'schema.graphql'), {
    loaders: [new GraphQLFileLoader()]
})

type ERC20TokenInfo = {
    name: string
    symbol: string
    decimals: number
}

type ERC20TokenBalance = {
    address: string
    balance: string
}

const root = {
    erc20_token_info({ token_address }: { token_address: string}): ERC20TokenInfo {
        console.log(`Fetching ERC20 token info for ${token_address}`)
        // TODO: hardcoded for now
        return {
            name: 'Solana',
            symbol: 'SOL',
            decimals: 18
        }
    },
    erc20_token_balance({ token_address, addresses }: { token_address: string, addresses: Array<string> }): Array<ERC20TokenBalance> {
        console.log(`Fetching ERC20 token balances for ${token_address} and ${addresses.length} addresses`)
        // TODO: hardcoded for now
        return [{
            address: '0xD87d2676B8bbd7d4bf7884089356F7BB82158cFe',
            balance: '1.234',
        }, {
            address: '0xb92f2d4B7aBD0aC3936A757FDb6413aaC03372e6',
            balance: '0.54321',
        }]
    },
}

const app = express()

app.all(
    '/graphql',
    createHandler({
        schema,
        rootValue: root,
    })
)

app.listen(config.GRAPHQL_API_PORT, () => {
    console.log(`Running GraphQL API server at port ${config.GRAPHQL_API_PORT}`)
})
