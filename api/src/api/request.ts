
export type TokenInfoRequest = {
    token_address: string
}

export type TokenBalancesRequest = {
    token_address: string
    addresses: Array<string>
}
