import { TokenBalanceRequest, TokenInfoRequest } from './request.js'
import { fetchInfoFromToken } from '../usecase/erc20/token_info.js'
import { fetchTokenBalances } from '../usecase/erc20/token_balance.js'
import {TokenBalance, TokenInfo} from '../model/erc20.js'

export const API_RESOLVER = {
    async erc20_token_info(req: TokenInfoRequest): Promise<TokenInfo> {
        return await fetchInfoFromToken(req.token_address)
    },

    async erc20_token_balances(req: TokenBalanceRequest): Promise<Array<TokenBalance>> {
        return await fetchTokenBalances(req.token_address, req.addresses)
    },
}
