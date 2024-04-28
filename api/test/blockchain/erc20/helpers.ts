import { Web3 } from 'web3'

//
// from the Solidity docs [https://docs.soliditylang.org/en/develop/abi-spec.html#function-selector]:
//
//  The first four bytes of the call data for a function call specifies the function to be called. It is the first
//  (left, high-order in big-endian) four bytes of the Keccak (SHA-3) hash of the signature of the function. The
//  signature is defined as the canonical expression of the basic prototype, i.e. the function name with the
//  parenthesised list of parameter types. Parameter types are split by a single comma - no spaces are used.
//
export const encodeFunctionSelector = (functionSignature: string): string => {
    const sha3 = Web3.utils.sha3(functionSignature)!
    const first4bytes = Web3.utils.hexToBytes(sha3).slice(0, 4)
    return Web3.utils.bytesToHex(first4bytes)
}

export const encodeAddressParameter = (address: string): string => {
    const sanitizedAddress = address.toLowerCase().slice(2) // removes 0x prefix
    return sanitizedAddress.padStart(64, '0') // it must fit 32 bytes
}

export const encodeStringResult = (value: string): string => {
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

export const encodeIntegerResult = (value: bigint): string => {
    const hexEncoded = Web3.utils.numberToHex(value).slice(2)
    const padded = hexEncoded.padStart(64, '0')
    return `0x${padded}`
}