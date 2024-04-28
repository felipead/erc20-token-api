import { Web3 , Contract, ContractAbi, BaseWeb3Error, ERR_ABI_ENCODING, ERR_VALIDATION } from 'web3'

import * as config from '../../config.js'
import ERC20TokenABI from './abi.json' assert {type: 'json'}
import {
    BaseERC20Error,
    InvalidAddressBalance,
    InvalidAddressFormat,
    InvalidTokenAddress,
    InvalidTokenResult
} from './error.js'
import { UnknownError } from '../../error/common.js'


const ENDPOINT = config.ETHEREUM_BLOCKCHAIN_ENDPOINT
console.info(`using ${ENDPOINT} as the Ethereum provider API endpoint`)

const PROVIDER = new Web3.providers.HttpProvider(ENDPOINT)
const WEB3 = new Web3(PROVIDER)

export class ERC20Token {

    private contract: Contract<ContractAbi>
    public readonly address: string

    constructor(address: string) {
        this.address = address
        this.contract = new WEB3.eth.Contract(ERC20TokenABI, address)
    }

    private wrapError(functionSignature: string, error: Error | unknown): BaseERC20Error {
        if (error instanceof BaseWeb3Error) {
            switch (error.code) {
                case ERR_ABI_ENCODING:
                    return new InvalidTokenAddress(this.address, functionSignature, error)
                case ERR_VALIDATION:
                    if (error.message.includes('must pass "address" validation')) {
                        return new InvalidAddressFormat(error)
                    }
            }
        }

        return new UnknownError(
            `unexpected error when calling ERC-20 token function. ` +
            `$function_signature: ${functionSignature}; $token_address: ${this.address}; $error: ${error}`,
            error instanceof Error ? error : undefined
        )
    }

    public async fetchName(): Promise<string> {
        const functionSignature = `name()`
        console.info(`calling ERC-20 function ${functionSignature} for token ${this.address} ...`)

        let result
        try {
            result = await this.contract.methods.name().call()
        } catch (error: Error | unknown) {
            throw this.wrapError(functionSignature, error)
        }

        if (result && typeof result === 'string') {
            return result
        }

        throw new InvalidTokenResult(this.address, functionSignature, result)
    }

    public async fetchSymbol(): Promise<string> {
        const functionSignature = `symbol()`
        console.info(`calling ERC-20 function ${functionSignature} for token ${this.address} ...`)

        let result
        try {
            result = await this.contract.methods.symbol().call()
        } catch (error: Error | unknown) {
            throw this.wrapError(functionSignature, error)
        }

        if (result && typeof result === 'string') {
            return result
        }

        throw new InvalidTokenResult(this.address, functionSignature, result)
    }

    public async fetchDecimals(): Promise<number> {
        const functionSignature = `decimals()`
        console.info(`calling ERC-20 function ${functionSignature} for token ${this.address} ...`)

        let result
        try {
            result = await this.contract.methods.decimals().call()
        } catch (error: Error | unknown) {
            throw this.wrapError(functionSignature, error)
        }

        if (result && typeof result === 'bigint') {
            return Number(result)
        }

        throw new InvalidTokenResult(this.address, functionSignature, result)
    }

    public async fetchTotalSupply(): Promise<bigint> {
        const functionSignature = `totalSupply()`
        console.info(`calling ERC-20 function ${functionSignature} for token ${this.address} ...`)

        let result
        try {
            result = await this.contract.methods.totalSupply().call()
        } catch (error: Error | unknown) {
            throw this.wrapError(functionSignature, error)
        }

        if (result && typeof result === 'bigint') {
            return result
        }

        throw new InvalidTokenResult(this.address, functionSignature, result)
    }

    public async fetchBalanceOf(address: string): Promise<bigint> {
        const functionSignature = `balanceOf(address)`
        console.info(
            `calling ERC-20 function ${functionSignature} for token ${this.address} and address ${address} ...`)

        let result
        try {
            result = await this.contract.methods.balanceOf(address).call()
        } catch (error: Error | unknown) {
            throw this.wrapError(functionSignature, error)
        }

        if (result != undefined && typeof result === 'bigint') {
            if (result == BigInt(0)) {
                throw new InvalidAddressBalance(this.address, functionSignature, address)
            }
            return result
        }

        throw new InvalidTokenResult(this.address, functionSignature, result)
    }
}
