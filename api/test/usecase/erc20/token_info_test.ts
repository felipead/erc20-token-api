import test from 'ava'

import { FetchTokenInfo } from '../../../src/usecase/erc20/token_info.js'
import { InvalidERC20Token, InvalidERC20TokenAddress } from '../../../src/blockchain/erc20/error.js'
import { ERC20Token } from '../../../src/blockchain/erc20/token.js'
import { ErrorType } from '../../../src/error/type.js'


test('build - with a valid token address', t => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const usecase = FetchTokenInfo.build(tokenAddress)
    t.is(usecase.token.address, tokenAddress)
})

test('build - with an invalid token address', t => {
    const invalidTokenAddress = '0xaaaaaaaaaaa'

    const error = t.throws(() => FetchTokenInfo.build(invalidTokenAddress))
    t.true(error instanceof InvalidERC20TokenAddress && error.type == ErrorType.InvalidArgument)
    t.true(error.message.includes('not an Ethereum address'))
})

test('execute - fetching name(), symbol() and decimals() from the Ethereum blockchain', async t => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'

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
    }

    const fake = new FakeERC20Token(tokenAddress)

    const info = await new FetchTokenInfo(fake).execute()
    t.is(info.name, 'Shiba Inu')
    t.is(info.symbol, 'SHIBA')
    t.is(info.decimals, 18)
})

test('execute - fails with invalid ERC-20 token', async t => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'

    class FakeERC20Token extends ERC20Token {
        async fetchName(): Promise<string> {
            throw new InvalidERC20Token(tokenAddress, 'name()')
        }
        async fetchSymbol(): Promise<string> {
            return 'SHIBA'
        }
        async fetchDecimals(): Promise<number> {
            return 18
        }
    }

    const fake = new FakeERC20Token(tokenAddress)

    const error = await t.throwsAsync(new FetchTokenInfo(fake).execute())
    t.true(error instanceof InvalidERC20Token && error.type == ErrorType.InvalidArgument)
    t.true(error.message.includes('address does not exist') && error.message.includes(tokenAddress))
})
