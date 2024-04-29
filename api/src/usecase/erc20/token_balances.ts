import { TokenBalance, TokenInfo } from '../../model/erc20.js'
import { ERC20Token } from '../../blockchain/erc20/token.js'
import { tokenBalanceToHumanReadable } from '../../domain/erc20/balance.js'
import { FetchTokenInfo } from './token_info.js'
import { InvalidArgument } from '../../error/common.js';

export class FetchTokenBalances {
    public readonly token: ERC20Token

    public constructor(token: ERC20Token) {
        this.token = token
    }

    public static build(tokenAddress: string): FetchTokenBalances {
        return new FetchTokenBalances(new ERC20Token(tokenAddress))
    }

    public async execute(addresses: Array<string>): Promise<Array<TokenBalance>> {
        if (addresses.length === 0) {
            throw new InvalidArgument('Received empty list of addresses to fetch balances for')
        }

        console.info(`fetching ERC-20 balances for token ${this.token.address} and ${addresses.length} addresses ...`)

        const tokenInfo = await new FetchTokenInfo(this.token).execute()

        const promises = addresses.map(i => this.fetchSingleTokenBalance(tokenInfo, i))

        //
        // right now, if fetching balance for one address fails, the entire request is aborted.
        // this could be improved - for example, return partial results.
        //

        return await Promise.all(promises)
    }

    private async fetchSingleTokenBalance(tokenInfo: TokenInfo, address: string): Promise<TokenBalance> {
        const balance = await this.token.fetchBalanceOf(address)
        const humanReadable = tokenBalanceToHumanReadable(balance, tokenInfo.decimals)

        return {
            address: address,
            balance: humanReadable
        }
    }
}
