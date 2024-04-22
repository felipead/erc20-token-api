import { gql, request } from 'graphql-request'

import * as config from './config.js'


const FetchERC20TokenInfo = gql`\
query FetchERC20TokenInfo($tokenAddress: String!) {
    erc20_token_info(token_address: $tokenAddress) {
        name
        symbol
        decimals
    }
}`

interface FetchERC20TokenInfoResponse {
    erc20_token_info: {
        name: string
        symbol: string
        decimals: number
    }
}

const FetchERC20TokenBalances = gql`\
query FetchERC20TokenBalances($tokenAddress: String!, $addresses: [String!]!) {
    erc20_token_balances(token_address: $tokenAddress, addresses: $addresses) {
        address
        balance
    }
}`

interface FetchERC20TokenBalancesResponse {
    erc20_token_info: {
        address: string
        balance: string
    }
}

const endpoint = config.GRAPHQL_API_ENDPOINT
console.log(`Connecting to the GraphQL API at ${endpoint})`)

const tokenAddress = '0x0000000000000000000000000000000000001111'

const erc20TokenInfo = await request<FetchERC20TokenInfoResponse>(endpoint, FetchERC20TokenInfo, {
    tokenAddress
})
console.log(erc20TokenInfo)

const erc20TokenBalances = await request<FetchERC20TokenBalancesResponse>(endpoint, FetchERC20TokenBalances, {
    tokenAddress,
    addresses: [
        '0xD87d2676B8bbd7d4bf7884089356F7BB82158cFe',
        '0xb92f2d4B7aBD0aC3936A757FDb6413aaC03372e6'
    ]
})
console.log(erc20TokenBalances)
