import { TokenInfo } from '../../model/erc20.js'
import { ERC20Token } from '../../blockchain/erc20/token.js'

export const fetchTokenInfo = async (tokenAddress: string): Promise<TokenInfo> => {
    console.log(`fetching ERC-20 info for token ${tokenAddress} ...`)

    const token = new ERC20Token(tokenAddress)
    const name = await token.fetchName()
    const symbol = await token.fetchSymbol()
    const decimals = await token.fetchDecimals()

    return {
        name: name,
        symbol: symbol,
        decimals: Number(decimals)
    }
}
