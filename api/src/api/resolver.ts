import { TokenBalancesRequest, TokenInfoRequest } from './request.js'
import { FetchTokenInfo } from '../usecase/erc20/token_info.js'
import { FetchTokenBalances } from '../usecase/erc20/token_balances.js'
import { TokenBalance, TokenInfo } from '../model/erc20.js'

export const API_RESOLVER = {
    async erc20_token_info(req: TokenInfoRequest): Promise<TokenInfo> {
        return await FetchTokenInfo.build(req.token_address).execute()
    },

    async erc20_token_balances(req: TokenBalancesRequest): Promise<Array<TokenBalance>> {
        return await FetchTokenBalances.build(req.token_address).execute(req.addresses)
    },
}
