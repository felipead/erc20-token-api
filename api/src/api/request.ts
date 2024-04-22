
export type TokenInfoRequest = {
    token_address: string
}

export type TokenBalanceRequest = {
    token_address: string
    addresses: Array<string>
}
