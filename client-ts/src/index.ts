import { Decimal } from 'decimal.js'

import USER_ADDRESSES_DATA from './data/addresses.json' assert { type: 'json' }
import { IUserAddresses } from './data/type.js'
import { fetchERC20TokenBalances, fetchERC20TokenInfo } from './integrations/blockchain-api/requests.js'
import { ERC20TokenInfo } from './integrations/blockchain-api/responses.js'

const TOKEN_ADDRESS = '0x0000000000000000000000000000000000001111'
const USER_ADDRESSES =  USER_ADDRESSES_DATA as IUserAddresses

const displayAddressBalance = (tokenInfo: ERC20TokenInfo, address: string, balance: string | undefined) => {
    if (balance) {
        console.log(`${address}: ${balance} ${tokenInfo.symbol}`)
    } else {
        console.log(`${address}: <error>`)
    }
}

const main = async () => {
    const tokenInfo = await fetchERC20TokenInfo(TOKEN_ADDRESS)
    Decimal.set({ rounding: Decimal.ROUND_HALF_UP, precision: 100 })

    const allAddresses = new Array<string>()
    for (const userAddresses of Object.values(USER_ADDRESSES)) {
        allAddresses.push(...userAddresses)
    }

    const balances = await fetchERC20TokenBalances(TOKEN_ADDRESS, allAddresses)
    const balanceByAddress = new Map<string, string>()
    for (const balance of balances) {
        balanceByAddress.set(balance.address, balance.balance)
    }

    for (const address of allAddresses) {
        displayAddressBalance(tokenInfo, address, balanceByAddress.get(address))
    }

    for (const [user, userAddresses] of Object.entries(USER_ADDRESSES)) {
        let sum = new Decimal(0)
        for (const address of userAddresses) {
            const balance = balanceByAddress.get(address) as string
            sum = sum.add(balance)
        }
        console.log(`${user}: ${sum.toFixed(tokenInfo.decimals)} ${tokenInfo.symbol}`)
    }
}

await main()
