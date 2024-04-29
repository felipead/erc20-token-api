import { TokenInfo } from '../../model/erc20.js'
import { ERC20Token } from '../../blockchain/erc20/token.js'

export class FetchTokenInfo {
    public readonly token: ERC20Token

    public constructor(token: ERC20Token) {
        this.token = token
    }

    public static build(tokenAddress: string): FetchTokenInfo {
        return new FetchTokenInfo(new ERC20Token(tokenAddress))
    }

    public async execute(): Promise<TokenInfo> {
        console.info(`fetching info for ERC-20 token ${this.token.address} ...`)

        const info = {
            name: await this.token.fetchName(),
            symbol: await this.token.fetchSymbol(),
            decimals: await this.token.fetchDecimals(),
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
}
