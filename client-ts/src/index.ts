import { Decimal } from 'decimal.js'

import USER_ADDRESSES_DATA from './data/addresses.json' assert { type: 'json' }
import { IUserAddresses } from './data/type.js'
import { fetchERC20TokenBalances, fetchERC20TokenInfo } from './integrations/blockchain-api/requests.js'
import {ERC20TokenBalance, ERC20TokenInfo} from './integrations/blockchain-api/responses.js'

const TOKEN_ADDRESS = '0x0000000000000000000000000000000000001111'
const USER_ADDRESSES =  USER_ADDRESSES_DATA as IUserAddresses

const precision = 50
Decimal.set({ precision, rounding: Decimal.ROUND_HALF_UP })

const main = async () => {
    const tokenInfo = await fetchERC20TokenInfo(TOKEN_ADDRESS)
    const allAddresses = getAllAddresses()

    const allBalances = await fetchERC20TokenBalances(TOKEN_ADDRESS, allAddresses)
    const balancesByAddress = sortBalancesByAddress(allBalances)

    for (const address of allAddresses) {
        displayAddressBalance(tokenInfo, address, balancesByAddress.get(address) as string)
    }

    for (const [user, userAddresses] of Object.entries(USER_ADDRESSES)) {
        let total = new Decimal(0)
        for (const address of userAddresses) {
            const balance = balancesByAddress.get(address) as string
            total = total.add(balance)
        }
        displayUserBalance(tokenInfo, user, total)
    }
}

const getAllAddresses = () => {
    const allAddresses = new Array<string>()
    for (const userAddresses of Object.values(USER_ADDRESSES)) {
        allAddresses.push(...userAddresses)
    }
    return allAddresses
}

const sortBalancesByAddress = (allBalances: Array<ERC20TokenBalance>) => {
    const balanceByAddress = new Map<string, string>()
    for (const balance of allBalances) {
        balanceByAddress.set(balance.address, balance.balance)
    }
    return balanceByAddress
}

const displayAddressBalance = (tokenInfo: ERC20TokenInfo, address: string, balance: string) => {
    console.log(`${address}: ${balance} ${tokenInfo.symbol}`)
}

const displayUserBalance = (tokenInfo: ERC20TokenInfo, user: string, totalBalance: Decimal) => {
    console.log(`${user}: ${totalBalance.toFixed(tokenInfo.decimals)} ${tokenInfo.symbol}`)
}

await main()
