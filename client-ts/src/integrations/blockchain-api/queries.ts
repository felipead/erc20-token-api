import { gql } from 'graphql-request'

export const FETCH_ERC20_TOKEN_INFO_QUERY = gql`\
query FetchERC20TokenInfo($tokenAddress: String!) {
    erc20_token_info(token_address: $tokenAddress) {
        name
        symbol
        decimals
        total_supply
    }
}`

export const FETCH_ERC20_TOKEN_BALANCES_QUERY = gql`\
query FetchERC20TokenBalances($tokenAddress: String!, $addresses: [String!]!) {
    erc20_token_balances(token_address: $tokenAddress, addresses: $addresses) {
        address
        balance
    }
}`
