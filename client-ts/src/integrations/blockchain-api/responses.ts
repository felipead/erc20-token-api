
export interface ERC20TokenInfo {
    name: string
    symbol: string
    decimals: number
}

export interface ERC20TokenInfoResponse {
    erc20_token_info: ERC20TokenInfo
}

export interface ERC20TokenBalance {
    address: string
    balance: string
}

export interface ERC20TokenBalancesResponse {
    erc20_token_balances: Array<ERC20TokenBalance>
}
