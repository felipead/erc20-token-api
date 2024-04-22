import { TokenInfo } from '../../model/erc20.js'
import { ERC20Token } from '../../blockchain/erc20/token.js'

export const fetchInfoFromToken = async (tokenAddress: string): Promise<TokenInfo> => {
    const token = new ERC20Token(tokenAddress)
    return fetchInfoFromTokenObject(token)
}

export const fetchInfoFromTokenObject = async (token: ERC20Token): Promise<TokenInfo> => {
    console.log(`fetching ERC-20 info for token ${token.address} ...`)

    const info = {
        name: await token.fetchName(),
        symbol: await token.fetchSymbol(),
        decimals: await token.fetchDecimals(),
    }

    //
    // TODO: cache token info on the ERC-20 address
    //   since this information should almost never change, it makes sense to be cached
    //   to relieve some of the burden on the node
    //   we can use an in-memory cache (eg: LRU cache or memoization)
    //   or redis for better availability (considering we might have multiple instances of this server in production)
    //

    return info
}
