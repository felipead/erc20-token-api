import test from 'ava'
import nock from 'nock'
import { Web3 } from 'web3'
import * as zlib from 'zlib'

import * as config from '../../../src/config.js'
import { ERC20Token } from '../../../src/blockchain/erc20/token.js'
import {
    InvalidAddressBalance, InvalidAddressFormat,
    InvalidTokenAddress
} from '../../../src/blockchain/erc20/error.js'

const ENDPOINT = config.ETHEREUM_BLOCKCHAIN_ENDPOINT
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

//
// We are using nock [https://github.com/nock/nock] to stub HTTP responses from the JSON-RPC API. Stubbing APIs at the
// protocol level has several benefits over using mocks. Most notably, we are exercising the JSON-RPC API boundaries
// and ensuring the contract is respected. It is also easier to capture and reproduce errors, specially at the
// transport level. Stubbing Ethereum JSON-RPC API calls can be challenging however, because of how parameters are
// binary-encoded in request and responses.
//
// - When adding new test cases, you can try `nock.recorder.rec()`. It will record and output the requests to stdout.
// - You can use the `Web3.utils.hexToNumber` or `Web3.utils.hexToUtf8` functions to decode the returned result.
// - Please note, the response body from the JSON-RPC HTTP API is gzipped, so it must be unzipped first.
// - Please use the helper functions below to programmatically stub the request, and encode input and output data.
//

const stubEthCall = (tokenAddress: string, encodedData: string, encodedResult: string): nock.Scope => {
    return nock(ENDPOINT)
        .post('/', {
            jsonrpc: '2.0',
            id: UUID_REGEX,
            method: 'eth_call',
            params: [{
                to: tokenAddress,
                data: encodedData
            },'latest']
        })
        .reply(200, (_, requestBody) => {
                const id = (typeof requestBody === 'object' && requestBody['id']) as string
                const response = {
                    jsonrpc: '2.0',
                    id: id,
                    result: encodedResult
                }
                return zlib.gzipSync(JSON.stringify(response))
            },
            [
                'Content-Encoding', 'gzip',
                'Content-Type', 'application/json',
            ]
        )
}

//
// from the Solidity docs [https://docs.soliditylang.org/en/develop/abi-spec.html#function-selector]:
//
//  The first four bytes of the call data for a function call specifies the function to be called. It is the first
//  (left, high-order in big-endian) four bytes of the Keccak (SHA-3) hash of the signature of the function. The
//  signature is defined as the canonical expression of the basic prototype, i.e. the function name with the
//  parenthesised list of parameter types. Parameter types are split by a single comma - no spaces are used.
//
const encodeFunctionSelector = (functionSignature: string): string => {
    const sha3 = Web3.utils.sha3(functionSignature)!
    const first4bytes = Web3.utils.hexToBytes(sha3).slice(0, 4)
    return Web3.utils.bytesToHex(first4bytes)
}

const encodeAddressParameter = (address: string): string => {
    const sanitizedAddress = address.toLowerCase().slice(2) // removes 0x prefix
    return sanitizedAddress.padStart(64, '0') // it must fit 32 bytes
}

const encodeStringResult = (value: string): string => {
    const blocks = ['0x']

    // first 32-byte block is the offset
    blocks.push('0000000000000000000000000000000000000000000000000000000000000020')

    const utf8Encoded = Buffer.from(value, 'utf-8').toString()
    const hexEncoded = Web3.utils.utf8ToHex(utf8Encoded).slice(2)

    // second 32-byte block is the string size, in bytes (right-to-left)
    const size = hexEncoded.length/2
    const hexSize = Web3.utils.numberToHex(size).slice(2)
    blocks.push(hexSize.padStart(64, '0'))

    // third 32-byte block is the string hex representation (left-to-right)
    blocks.push(hexEncoded.padEnd(64, '0'))

    return blocks.join('')
}

const encodeIntegerResult = (value: bigint): string => {
    const hexEncoded = Web3.utils.numberToHex(value).slice(2)
    const padded = hexEncoded.padStart(64, '0')
    return `0x${padded}`
}

test.afterEach.always(() => {
    nock.cleanAll()
})

test.serial('fetch ERC-20 token name', async (t) => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const expectedTokenName = 'Zorreth'

    const encodedData = encodeFunctionSelector('name()')
    const encodedResult = encodeStringResult(expectedTokenName)
    const scope = stubEthCall(tokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(tokenAddress)
    const fetched = await token.fetchName()

    t.is(fetched, expectedTokenName)
    t.true(scope.isDone())
})

test.serial('fetch ERC-20 token name - fail token address does not exist', async (t) => {
    const nonexistentTokenAddress = '0x0000000000000000000000000000000000666666'

    const encodedData = encodeFunctionSelector('name()')
    const encodedResult = '0x'
    const scope = stubEthCall(nonexistentTokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(nonexistentTokenAddress)
    const error = await t.throwsAsync(token.fetchName())

    t.true(error instanceof InvalidTokenAddress)
    t.is(
        error.message,
        `Could not decode ERC-20 call result. You might see this error if the address does not exist, ` +
        `the node has not been fully synced, or it is not an ERC-20 compliant contract. ` +
        `$token_address: 0x0000000000000000000000000000000000666666; $function_signature: name()`
    )
    t.true(scope.isDone())
})

test.serial('fetch ERC-20 token symbol', async (t) => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const expectedTokenSymbol = 'ZRETH'

    const encodedData = encodeFunctionSelector('symbol()')
    const encodedResult = encodeStringResult(expectedTokenSymbol)
    const scope = stubEthCall(tokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(tokenAddress)
    const fetched = await token.fetchSymbol()

    t.is(fetched, expectedTokenSymbol)
    t.true(scope.isDone())
})

test.serial('fetch ERC-20 token symbol - fail token address does not exist', async (t) => {
    const nonexistentTokenAddress = '0x0000000000000000000000000000000000666666'

    const encodedData = encodeFunctionSelector('symbol()')
    const encodedResult = '0x'
    const scope = stubEthCall(nonexistentTokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(nonexistentTokenAddress)
    const error = await t.throwsAsync(token.fetchSymbol())

    t.true(error instanceof InvalidTokenAddress)
    t.is(
        error.message,
        `Could not decode ERC-20 call result. You might see this error if the address does not exist, ` +
        `the node has not been fully synced, or it is not an ERC-20 compliant contract. ` +
        `$token_address: 0x0000000000000000000000000000000000666666; $function_signature: symbol()`
    )
    t.true(scope.isDone())
})

test.serial('fetch ERC-20 token decimals', async (t) => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const expectedDecimals = BigInt(5)

    const encodedData = encodeFunctionSelector('decimals()')
    const encodedResult = encodeIntegerResult(expectedDecimals)
    const scope = stubEthCall(tokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(tokenAddress)
    const fetched = await token.fetchDecimals()

    t.is(fetched, Number(expectedDecimals))
    t.true(scope.isDone())
})

test.serial('fetch ERC-20 token decimals - fail token address does not exist', async (t) => {
    const nonexistentTokenAddress = '0x0000000000000000000000000000000000666666'

    const encodedData = encodeFunctionSelector('decimals()')
    const encodedResult = '0x'
    const scope = stubEthCall(nonexistentTokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(nonexistentTokenAddress)
    const error = await t.throwsAsync(token.fetchDecimals())

    t.true(error instanceof InvalidTokenAddress)
    t.is(
        error.message,
        `Could not decode ERC-20 call result. You might see this error if the address does not exist, ` +
        `the node has not been fully synced, or it is not an ERC-20 compliant contract. ` +
        `$token_address: 0x0000000000000000000000000000000000666666; $function_signature: decimals()`
    )
    t.true(scope.isDone())
})

test.serial('fetch ERC-20 token total supply', async (t) => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const expectedTotalSupply = BigInt('18913469089218429310297331818')

    const encodedData = encodeFunctionSelector('totalSupply()')
    const encodedResult = encodeIntegerResult(expectedTotalSupply)
    const scope = stubEthCall(tokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(tokenAddress)
    const fetched = await token.fetchTotalSupply()

    t.is(fetched, expectedTotalSupply)
    t.true(scope.isDone())
})

test.serial('fetch ERC-20 token total supply - fail token address does not exist', async (t) => {
    const nonexistentTokenAddress = '0x0000000000000000000000000000000000666666'

    const encodedData = encodeFunctionSelector('totalSupply()')
    const encodedResult = '0x'
    const scope = stubEthCall(nonexistentTokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(nonexistentTokenAddress)
    const error = await t.throwsAsync(token.fetchTotalSupply())

    t.true(error instanceof InvalidTokenAddress)
    t.is(
        error.message,
        `Could not decode ERC-20 call result. You might see this error if the address does not exist, ` +
        `the node has not been fully synced, or it is not an ERC-20 compliant contract. ` +
        `$token_address: 0x0000000000000000000000000000000000666666; $function_signature: totalSupply()`
    )
    t.true(scope.isDone())
})

test.serial('fetch ERC-20 token balance for address', async (t) => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const address = '0x35579dD4fa266ABE6380868fcaE65CA2017a6806'
    const expectedBalance = BigInt('734445571472928886574449575')

    const functionSelector = encodeFunctionSelector('balanceOf(address)')
    const encodedData = functionSelector + encodeAddressParameter(address)

    const encodedResult = encodeIntegerResult(expectedBalance)
    const scope = stubEthCall(tokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(tokenAddress)
    const fetched = await token.fetchBalanceOf(address)

    t.is(fetched, expectedBalance)
    t.true(scope.isDone())
})

test.serial('fetch ERC-20 token balance for address - fail token address does not exist', async (t) => {
    const nonexistentTokenAddress = '0x0000000000000000000000000000000000666666'
    const address = '0x35579dD4fa266ABE6380868fcaE65CA2017a6806'

    const functionSelector = encodeFunctionSelector('balanceOf(address)')
    const encodedData = functionSelector + encodeAddressParameter(address)

    const encodedResult = '0x'
    const scope = stubEthCall(nonexistentTokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(nonexistentTokenAddress)
    const error = await t.throwsAsync(token.fetchBalanceOf(address))

    t.true(error instanceof InvalidTokenAddress)
    t.is(
        error.message,
        `Could not decode ERC-20 call result. You might see this error if the address does not exist, ` +
        `the node has not been fully synced, or it is not an ERC-20 compliant contract. ` +
        `$token_address: 0x0000000000000000000000000000000000666666; $function_signature: balanceOf(address)`
    )
    t.true(scope.isDone())
})

test.serial('fetch ERC-20 token balance for address - fail address does not exist', async (t) => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const nonexistentAddress = '0x0000000000000000000000000000aaaaaaaaaaaa'

    const functionSelector = encodeFunctionSelector('balanceOf(address)')
    const encodedData = functionSelector + encodeAddressParameter(nonexistentAddress)

    const encodedResult = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const scope = stubEthCall(tokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(tokenAddress)
    const error = await t.throwsAsync(token.fetchBalanceOf(nonexistentAddress))

    t.true(error instanceof InvalidAddressBalance)
    t.is(
        error.message,
        `The ERC-20 balanceOf(address) call result returned zero. This most likely means the address ` +
        `does not exist, although it could also mean the address does not have any balance. ` +
        `$token_address: 0x0000000000000000000000000000000000001111; $function_signature: balanceOf(address); ` +
        `$address: 0x0000000000000000000000000000aaaaaaaaaaaa`
    )
    t.true(scope.isDone())
})

test.serial('fetch ERC-20 token balance for address - fail invalid address format', async (t) => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const bogusAddress = '0xaaaaaaaaaaaa'

    const token = new ERC20Token(tokenAddress)
    const error = await t.throwsAsync(token.fetchBalanceOf(bogusAddress))

    t.true(error instanceof InvalidAddressFormat)
    t.true(error.message.includes(`Invalid address format`))
})
