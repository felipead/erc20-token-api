import { TokenBalance, TokenInfo } from '../../model/erc20.js'
import { ERC20Token } from '../../blockchain/erc20/token.js'
import { tokenBalanceToHumanReadable } from '../../domain/erc20/balance.js'
import { fetchInfoFromTokenObject } from './token_info.js'

export const fetchTokenBalances = async (tokenAddress: string, addresses: Array<string>):
    Promise<Array<TokenBalance>> => {
    console.log(`fetching ERC-20 balances for token ${tokenAddress} and ${addresses.length} addresses ...`)

    const token = new ERC20Token(tokenAddress)
    const tokenInfo = await fetchInfoFromTokenObject(token)

    const balances = new Array<TokenBalance>(addresses.length)
    for (const i in addresses) {
        const address = addresses[i]
        // TODO: handle errors
        // TODO: execute request in parallel
        balances[i] = await fetchSingleTokenBalance(token, tokenInfo, address)
    }

    return balances
}

export const fetchSingleTokenBalance = async (token: ERC20Token, tokenInfo: TokenInfo, address: string): Promise<TokenBalance> => {
    const balance = await token.fetchBalanceOf(address)
    const humanReadable = tokenBalanceToHumanReadable(balance, tokenInfo.decimals, tokenInfo.totalSupply)

    return {
        address: address,
        balance: humanReadable
    }
}
