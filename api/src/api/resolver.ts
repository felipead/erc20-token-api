import { ERC20TokenBalanceRequest, ERC20TokenInfoRequest } from './request.js'
import { ERC20TokenBalance, ERC20TokenInfo } from '../model/erc20.js'

import { fetchERC20TokenInfo } from '../usecase/erc20/token_info.js'
import { fetchERC20TokenBalances } from '../usecase/erc20/token_balance.js'

export const API_RESOLVER = {

    async erc20_token_info(req: ERC20TokenInfoRequest): Promise<ERC20TokenInfo> {
        console.log(`Fetching ERC20 token info for ${req.token_address}`)
        return await fetchERC20TokenInfo(req.token_address)
    },

    async erc20_token_balances(req: ERC20TokenBalanceRequest): Promise<Array<ERC20TokenBalance>> {
        console.log(`Fetching ERC20 token balances for ${req.token_address} and ${req.addresses.length} addresses`)
        return await fetchERC20TokenBalances(req.token_address, req.addresses)
    },
}
