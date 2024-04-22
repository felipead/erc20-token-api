
export type ERC20TokenInfoRequest = {
    token_address: string
}

export type ERC20TokenBalanceRequest = {
    token_address: string
    addresses: Array<string>
}
