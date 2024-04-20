import { join } from 'node:path'

import express from 'express'
import { createHandler } from 'graphql-http/lib/use/express'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'


const __dirname = import.meta.dirname;
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

// TODO: load port from environment variable
app.listen(4000, () => {
    console.log('Running a GraphQL API server at http://localhost:4000/graphql')
})
