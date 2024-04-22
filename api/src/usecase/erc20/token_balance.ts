import { ERC20TokenBalance  } from '../../model/erc20.js'

export const fetchERC20TokenBalances = async (tokenAddress: string, addresses: Array<string>):
    Promise<Array<ERC20TokenBalance>> => {
    return [{
        address: addresses.at(0) || '',
        balance: '1.234',
    }, {
        address: addresses.at(1) || '',
        balance: '0.54321',
    }]
}
