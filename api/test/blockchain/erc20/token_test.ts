import test from 'ava'
import nock from 'nock'
import { Web3 } from 'web3'
import * as zlib from 'node:zlib'

import * as config from '../../../src/config.js'
import { ERC20Token } from '../../../src/blockchain/erc20/token.js'

const ENDPOINT = config.ETHEREUM_BLOCKCHAIN_ENDPOINT
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

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
            ])
}

//
// from the Solidity docs [https://docs.soliditylang.org/en/develop/abi-spec.html#function-selector]:
//
//  The first four bytes of the call data for a function call specifies the function to be called. It is the first
//  (left, high-order in big-endian) four bytes of the Keccak (SHA-3) hash of the signature of the function. The
//  signature is defined as the canonical expression of the basic prototype, i.e. the function name with the
//  parenthesised list of parameter types. Parameter types are split by a single comma - no spaces are used.
//
const encodeFunctionData = (signature: string): string => {
    const sha3 = Web3.utils.sha3(signature)!
    const first4bytes = Web3.utils.hexToBytes(sha3).slice(0, 4)
    return Web3.utils.bytesToHex(first4bytes)
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

test('fetch ERC-20 token name', async (t) => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const expectedTokenName = 'Zorreth'

    const encodedData = encodeFunctionData('name()')
    const encodedResult = encodeStringResult(expectedTokenName)
    const scope = stubEthCall(tokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(tokenAddress)
    const fetched = await token.fetchName()

    t.is(fetched, expectedTokenName)
    t.true(scope.isDone())
})


test('fetch ERC-20 token symbol', async (t) => {
    const tokenAddress = '0x0000000000000000000000000000000000001111'
    const expectedTokenSymbol = 'ZRETH'

    const encodedData = encodeFunctionData('symbol()')
    const encodedResult = encodeStringResult(expectedTokenSymbol)
    const scope = stubEthCall(tokenAddress, encodedData, encodedResult)

    const token = new ERC20Token(tokenAddress)
    const fetched = await token.fetchSymbol()

    t.is(fetched, expectedTokenSymbol)
    t.true(scope.isDone())
})
