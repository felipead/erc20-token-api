import { TokenBalance, TokenInfo } from '../../model/erc20.js'
import { ERC20Token } from '../../blockchain/erc20/token.js'
import { tokenBalanceToHumanReadable } from '../../domain/erc20/balance.js'
import { fetchInfoFromTokenObject } from './token_info.js'

export const fetchTokenBalances = async (tokenAddress: string, addresses: Array<string>):
    Promise<Array<TokenBalance>> => {
    console.log(`fetching ERC-20 balances for token ${tokenAddress} and ${addresses.length} addresses ...`)

    const token = new ERC20Token(tokenAddress)
    const tokenInfo = await fetchInfoFromTokenObject(token)

    //
    // By running these requests in parallel, we will greatly reduce latency and also
    // prevent the main request from timing out.
    //

    const promises = addresses.map((i) => {
        return fetchSingleTokenBalance(token, tokenInfo, i)
    })

    return await Promise.all(promises)
}

export const fetchSingleTokenBalance = async (token: ERC20Token, tokenInfo: TokenInfo, address: string): Promise<TokenBalance> => {
    const balance = await token.fetchBalanceOf(address)
    const humanReadable = tokenBalanceToHumanReadable(balance, tokenInfo.decimals)

    return {
        address: address,
        balance: humanReadable
    }
}
