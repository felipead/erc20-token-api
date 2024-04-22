import { ERC20TokenInfo } from '../../model/erc20.js'

export const fetchERC20TokenInfo = async (tokenAddress: string): Promise<ERC20TokenInfo> => {
    return {
        name: 'foo' + tokenAddress,
        symbol: 'FOO',
        decimals: 18
    }
}