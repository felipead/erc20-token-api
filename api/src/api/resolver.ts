import { TokenBalanceRequest, TokenInfoRequest } from './request.js'
import { fetchInfoFromToken } from '../usecase/erc20/token_info.js'
import { fetchTokenBalances } from '../usecase/erc20/token_balance.js'
import { TokenInfoResponse } from './response.js'
import { TokenBalance } from '../model/erc20.js'

export const API_RESOLVER = {
    async erc20_token_info(req: TokenInfoRequest): Promise<TokenInfoResponse> {
        const info = await fetchInfoFromToken(req.token_address)

        return {
            name: info.name,
            symbol: info.symbol,
            decimals: info.decimals,
            total_supply: info.totalSupply.toString()
        }
    },

    async erc20_token_balances(req: TokenBalanceRequest): Promise<Array<TokenBalance>> {
        return await fetchTokenBalances(req.token_address, req.addresses)
    },
}
