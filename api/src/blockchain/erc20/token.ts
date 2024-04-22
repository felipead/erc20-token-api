import { Contract, ContractAbi, Web3 } from 'web3'

import * as config from '../../config.js'
import ERC20TokenABI from './abi.json' assert {type: 'json'}
import { InvalidERC20CallReturnValueError } from './error.js'

const ENDPOINT = config.ETHEREUM_BLOCKCHAIN_ENDPOINT
console.info(`using ${ENDPOINT} as the Ethereum provider API endpoint`)

const PROVIDER = new Web3.providers.HttpProvider(ENDPOINT)
const WEB3 = new Web3(PROVIDER)

export class ERC20Token {

    private internal: Contract<ContractAbi>

    public readonly address: string

    constructor(address: string) {
        this.address = address
        this.internal = new WEB3.eth.Contract(ERC20TokenABI, address)
    }

    public async fetchName(): Promise<string> {
        console.info(`fetching ERC-20 name() for token ${this.address} ...`)

        const name= await this.internal.methods.name().call()
        if (name) {
            return name.toString()
        }

        throw new InvalidERC20CallReturnValueError('name')
    }

    public async fetchSymbol(): Promise<string> {
        console.info(`fetching ERC-20 symbol() for token ${this.address} ...`)

        const symbol= await this.internal.methods.symbol().call()
        if (symbol) {
            return symbol.toString()
        }

        throw new InvalidERC20CallReturnValueError('symbol')
    }

    public async fetchDecimals(): Promise<bigint> {
        console.info(`fetching ERC-20 decimals() for token ${this.address} ...`)

        const decimals= await this.internal.methods.decimals().call()
        if (decimals && typeof decimals === 'bigint') {
            return decimals
        }

        console.error(`invalid ERC-20 return value received: ${decimals}`)
        throw new InvalidERC20CallReturnValueError('decimals')
    }

    public async fetchBalanceOf(address: string): Promise<bigint> {
        console.info(`fetching ERC-20 balanceOf() for token ${this.address} and address ${address} ...`)

        const balance = await this.internal.methods.balanceOf(address).call()
        if (balance && typeof balance === 'bigint') {
            return balance
        }

        console.error(`invalid ERC-20 return value received: ${balance}`)
        throw new InvalidERC20CallReturnValueError('balanceOf')
    }
}
