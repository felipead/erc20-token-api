import { TokenBalance } from '../../model/erc20.js'
import { ERC20Token } from '../../blockchains/erc20/token.js'

export const fetchTokenBalances = async (tokenAddress: string, addresses: Array<string>):
    Promise<Array<TokenBalance>> => {
    console.log(`fetching ERC-20 balances for token ${tokenAddress} and ${addresses.length} addresses ...`)

    const token = new ERC20Token(tokenAddress)

    const balances = new Array<TokenBalance>(addresses.length)
    for (const i in addresses) {
        const address = addresses[i]
        // TODO: handle errors
        const balance = await fetchSingleTokenBalance(token, addresses[i])
        balances[i] = {
            address: address,
            balance: balance.toString() // FIXME: use bigint
        }
    }

    return balances
}

export const fetchSingleTokenBalance = async (token: ERC20Token, address: string): Promise<bigint> => {
    return await token.fetchBalanceOf(address)
}
