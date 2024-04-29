import test from 'ava'

import { InvalidAddressBalance, InvalidERC20TokenAddress } from '../../../src/blockchain/erc20/error.js'
import { ErrorType } from '../../../src/error/type.js'
import { FetchTokenBalances } from '../../../src/usecase/erc20/token_balances.js'
import { ERC20Token } from '../../../src/blockchain/erc20/token.js'
import { InvalidArgument } from '../../../src/error/common.js';


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

test('execute - fail when given zero addresses', async t => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'

    const error = await t.throwsAsync(FetchTokenBalances.build(tokenAddress).execute([]))
    t.true(error instanceof InvalidArgument && error.type == ErrorType.InvalidArgument)
    t.is(error.message, 'Received empty list of addresses to fetch balances for')
})
