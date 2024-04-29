import test from 'ava'

import {
    InvalidAddressBalance,
    InvalidAddressFormat,
    InvalidERC20TokenAddress
} from '../../../src/blockchain/erc20/error.js'
import { ErrorType } from '../../../src/error/type.js'
import { FetchTokenBalances } from '../../../src/usecase/erc20/token_balances.js'
import { ERC20Token } from '../../../src/blockchain/erc20/token.js'
import { InvalidArgument } from '../../../src/error/common.js'
import { TokenBalance } from '../../../src/model/erc20.js'
import { tokenBalanceToHumanReadable } from '../../../src/domain/erc20/balance.js'


test('build - with a valid token address', t => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const usecase = FetchTokenBalances.build(tokenAddress)
    t.is(usecase.token.address, tokenAddress)
})

test('build - with an invalid token address', t => {
    const invalidTokenAddress = '0xaaaaaaaaaaa'

    const error = t.throws(() => FetchTokenBalances.build(invalidTokenAddress))
    t.true(error instanceof InvalidERC20TokenAddress && error.type == ErrorType.InvalidArgument)
    t.true(error.message.includes('not an Ethereum address'))
})

test('execute - fetch balanceOf(address) for one address and format to decimal precision', async t => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const targetAddress = '0x625688360a92266567561e38404370dEa088c2c1'

    class FakeERC20Token extends ERC20Token {
        async fetchName(): Promise<string> {
            return 'Shiba Inu'
        }
        async fetchSymbol(): Promise<string> {
            return 'SHIBA'
        }
        async fetchDecimals(): Promise<number> {
            return 18
        }
        async fetchBalanceOf(address: string): Promise<bigint> {
            if (address === targetAddress) {
                return BigInt('885446289463920385870283981')
            }
            throw new InvalidAddressBalance(this.address, 'balanceOf(address)', address)
        }
    }

    const fake = new FakeERC20Token(tokenAddress)

    const balances = await new FetchTokenBalances(fake).execute([targetAddress])
    t.is(balances.length, 1)
    t.is(balances[0].address, targetAddress)
    t.is(balances[0].balance, '885446289.463920385870283981')
})

test('execute - fetch balanceOf(address) for multiple addresses', async t => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const addressBalances = new Map<string, bigint>([
        ['0xD87d2676B8bbd7d4bf7884089356F7BB82158cFe', BigInt('338837094166711175252867320')],
        ['0x2deEeeB26b7bDDACAB22a5357b3f7Dbc5aBDdB25', BigInt('705758795642543527632738427')],
        ['0xC3A547C5cE7b44d74FC2712DE2E9D8B892bc9d5d', BigInt('786304140710549114449133045')],
        ['0xeCE8F2c7A9dbB40eA59c35df2e717F0D517A805D', BigInt('250162677914072402495485170')],
        ['0xf0F8e87DA6D4f2A64e42D60a5259eBD44a2FE876', BigInt('914314699145281112990461987')],
    ])
    const decimals = 9

    const targetAddresses = Array.from(addressBalances.keys())

    class FakeERC20Token extends ERC20Token {
        async fetchName(): Promise<string> {
            return 'Shiba Inu'
        }
        async fetchSymbol(): Promise<string> {
            return 'SHIBA'
        }
        async fetchDecimals(): Promise<number> {
            return decimals
        }
        async fetchBalanceOf(address: string): Promise<bigint> {
            if (addressBalances.has(address)) {
                return addressBalances.get(address)!
            }
            throw new InvalidAddressBalance(this.address, 'balanceOf(address)', address)
        }
    }

    const fake = new FakeERC20Token(tokenAddress)

    const returnedBalances = await new FetchTokenBalances(fake).execute(targetAddresses)
    t.is(returnedBalances.length, targetAddresses.length)

    for (const address of targetAddresses) {
        let found: TokenBalance | null = null
        for (const balance of returnedBalances) {
            if (balance.address == address) {
                const returnedBalance = balance.balance
                const actualBalance = tokenBalanceToHumanReadable(addressBalances.get(address)!, decimals)
                t.is(returnedBalance, actualBalance, `address ${address} balance matches`)
                found = balance
            }
        }
        t.truthy(found, `found address ${address}`)
    }
})

test('execute - fail when given zero addresses', async t => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'

    const error = await t.throwsAsync(FetchTokenBalances.build(tokenAddress).execute([]))
    t.true(error instanceof InvalidArgument && error.type == ErrorType.InvalidArgument)
    t.is(error.message, 'Received empty list of addresses to fetch balances for')
})

test('execute - fail the entire request when given one invalid address', async t => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const addressBalances = new Map<string, bigint>([
        ['0xD87d2676B8bbd7d4bf7884089356F7BB82158cFe', BigInt('338837094166711175252867320')],
        ['0x2deEeeB26b7bDDACAB22a5357b3f7Dbc5aBDdB25', BigInt('705758795642543527632738427')],
        ['0xC3A547C5cE7b44d74FC2712DE2E9D8B892bc9d5d', BigInt('786304140710549114449133045')],
        ['0xeCE8F2c7A9dbB40eA59c35df2e717F0D517A805D', BigInt('250162677914072402495485170')],
        ['0xf0F8e87DA6D4f2A64e42D60a5259eBD44a2FE876', BigInt('914314699145281112990461987')],
    ])
    const bogusAddress = '0xaaaaaaaaaaa'

    const targetAddresses = Array.from(addressBalances.keys())
    targetAddresses.push(bogusAddress)

    class FakeERC20Token extends ERC20Token {
        async fetchName(): Promise<string> {
            return 'Shiba Inu'
        }
        async fetchSymbol(): Promise<string> {
            return 'SHIBA'
        }
        async fetchDecimals(): Promise<number> {
            return 18
        }
        async fetchBalanceOf(address: string): Promise<bigint> {
            if (addressBalances.has(address)) {
                return addressBalances.get(address)!
            }
            if (address == bogusAddress) {
                throw new InvalidAddressFormat(
                    this.address,
                    'balanceOf(address)',
                    new Error(`invalid address ${address}`)
                )
            }

            throw new Error('should not happen!')
        }
    }

    const fake = new FakeERC20Token(tokenAddress)

    const error = await t.throwsAsync(new FetchTokenBalances(fake).execute(targetAddresses))
    t.true(error instanceof InvalidAddressFormat)
    t.true(error.message.includes(bogusAddress))
})
