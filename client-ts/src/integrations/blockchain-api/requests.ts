import { request } from 'graphql-request'

import * as config from '../../config.js'
import { FETCH_ERC20_TOKEN_BALANCES_QUERY, FETCH_ERC20_TOKEN_INFO_QUERY } from './queries.js'
import { ERC20TokenBalance, ERC20TokenBalancesResponse, ERC20TokenInfo, ERC20TokenInfoResponse } from './responses.js'

const endpoint = config.GRAPHQL_API_ENDPOINT
console.log(`using ${endpoint} as the GraphQL API endpoint`)

export const fetchERC20TokenInfo = async (tokenAddress: string):
    Promise<ERC20TokenInfo> => {
    const response = await request<ERC20TokenInfoResponse>(endpoint, FETCH_ERC20_TOKEN_INFO_QUERY, {
        tokenAddress
    })
    return response.erc20_token_info
}

export const fetchERC20TokenBalances = async (tokenAddress: string, addresses: Array<string>):
    Promise<Array<ERC20TokenBalance>> => {
    const response = await request<ERC20TokenBalancesResponse>(endpoint, FETCH_ERC20_TOKEN_BALANCES_QUERY, {
        tokenAddress,
        addresses
    })
    return response.erc20_token_balances
}
