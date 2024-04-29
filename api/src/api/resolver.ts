import { TokenBalanceRequest, TokenInfoRequest } from './request.js'
import { FetchTokenInfo } from '../usecase/erc20/token_info.js'
import { fetchTokenBalances } from '../usecase/erc20/token_balance.js'
import { TokenBalance, TokenInfo } from '../model/erc20.js'

export const API_RESOLVER = {
    async erc20_token_info(req: TokenInfoRequest): Promise<TokenInfo> {
        return await FetchTokenInfo.build(req.token_address).execute()
    },

    async erc20_token_balances(req: TokenBalanceRequest): Promise<Array<TokenBalance>> {
        return await fetchTokenBalances(req.token_address, req.addresses)
    },
}
