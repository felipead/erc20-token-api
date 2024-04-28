import test from 'ava'
import nock from 'nock'
import { Web3 } from 'web3'
import * as zlib from 'node:zlib'

import * as config from '../../../src/config.js'
import { ERC20Token } from '../../../src/blockchain/erc20/token.js'

//
// We are using nock [https://github.com/nock/nock] to intercept, stub and replay the JSON-RPC requests
// and responses with the go-ethereum HTTP backend. The benefits are reliable, reproducible tests that
// exercise the full integration and helps ensure the API contract is respected.
//
// In order to record new requests, please use:
//
//     nock.recorder.rec()
//
// which will record the HTTP request/response and print it to the stdout. You can then copy it and adapt it
// to stub the JSON-RPC API call in your test.
//

const ENDPOINT = config.ETHEREUM_BLOCKCHAIN_ENDPOINT
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

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
    const functionData = encodeFunctionData('name()')

    const expectedTokenName = 'Zorreth'
    const encodedResult = encodeStringResult(expectedTokenName)

    const scope = nock(ENDPOINT)
        .post('/', {
            jsonrpc: '2.0',
            id: UUID_REGEX,
            method: 'eth_call',
            params: [{
                to: tokenAddress,
                data: functionData
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

    const token = new ERC20Token(tokenAddress)
    const name = await token.fetchName()

    t.is(name, expectedTokenName)
    t.true(scope.isDone())
})
