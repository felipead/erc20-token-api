import { BaseError } from '../../error/base.js'
import { ErrorType } from '../../error/type.js'

export abstract class BaseERC20Error extends BaseError {
}

export class InvalidERC20Token extends BaseERC20Error {
    constructor(tokenAddress: string, functionSignature: string, innerError?: Error) {
        const msg = (
            `Could not decode ERC-20 call result. You might see this error if the address does not exist, ` +
            `the node has not been fully synced, or it is not an ERC-20 compliant contract. ` +
            `$token_address: ${tokenAddress}; $function_signature: ${functionSignature}`
        )
        super(ErrorType.InvalidArgument, msg, innerError)
    }
}

export class InvalidERC20TokenAddress extends BaseERC20Error {
    constructor(tokenAddress: string, innerError?: Error) {
        const msg = (
            `Invalid ERC-20 token address format - not an Ethereum address. ` +
            `$token_address: ${tokenAddress}`
        )
        super(ErrorType.InvalidArgument, msg, innerError)
    }
}

export class InvalidERC20CallResult extends BaseERC20Error {
    constructor(tokenAddress: string, functionSignature: string, result: unknown) {
        const msg = (
            `The ERC-20 call result is invalid. ` +
            `$token_address: ${tokenAddress}; $function_signature: ${functionSignature}; ` +
            `$result: ${result}`
        )
        super(ErrorType.Internal, msg)
    }
}

export class InvalidAddressBalance extends BaseERC20Error {
    constructor(tokenAddress: string, functionSignature: string, address: string) {
        const msg = (
            `The ERC-20 balanceOf(address) call result returned zero. ` +
            `This most likely means the address does not exist, although it could also mean ` +
            `the address does not have any balance. ` +
            `$token_address: ${tokenAddress}; $function_signature: ${functionSignature}; ` +
            `$address: ${address}`
        )
        super(ErrorType.InvalidArgument, msg)
    }
}

export class InvalidAddressFormat extends BaseERC20Error {
    constructor(tokenAddress: string, functionSignature: string, innerError?: Error) {
        const msg = (
            `Invalid address format as an input to a ERC-20 function call. ` +
            `$token_address: ${tokenAddress}; $function_signature: ${functionSignature}`
        )
        super(ErrorType.InvalidArgument, msg, innerError)
    }
}
