import { Contract, ContractAbi, Web3 } from 'web3'

import * as config from '../../config.js'
import ERC20TokenABI from './abi.json' assert {type: 'json'}
import { InvalidERC20CallReturnValueError } from './error.js'

const PROVIDER = new Web3.providers.HttpProvider(config.ETHEREUM_BLOCKCHAIN_ENDPOINT)
const WEB3 = new Web3(PROVIDER)

export const buildToken = (address: string): Contract<ContractAbi> => {
    return new WEB3.eth.Contract(ERC20TokenABI, address)
}

export const fetchTokenName = async (token: Contract<ContractAbi>): Promise<string> => {
    console.info(`fetching ERC-20 name() for token ${token.options.address} ...`)

    const name= await token.methods.name().call()
    if (name) {
        return name.toString()
    }

    throw new InvalidERC20CallReturnValueError('name')
}

export const fetchTokenSymbol = async (token: Contract<ContractAbi>): Promise<string> => {
    console.info(`fetching ERC-20 symbol() for token ${token.options.address} ...`)

    const symbol= await token.methods.symbol().call()
    if (symbol) {
        return symbol.toString()
    }

    throw new InvalidERC20CallReturnValueError('symbol')
}

export const fetchTokenDecimals = async (token: Contract<ContractAbi>): Promise<bigint> => {
    console.info(`fetching ERC-20 decimals() for token ${token.options.address} ...`)

    const decimals= await token.methods.decimals().call()
    if (decimals && typeof decimals === 'bigint') {
        return decimals
    }

    console.error(`invalid ERC-20 return value received: ${decimals}`)
    throw new InvalidERC20CallReturnValueError('decimals')
}

export const fetchBalanceOf = async(token: Contract<ContractAbi>, address: string): Promise<bigint> => {
    console.info(`fetching ERC-20 balanceOf() for token ${token.options.address} and address ${address} ...`)

    const balance = await token.methods.balanceOf(address).call()
    if (balance && typeof balance === 'bigint') {
        return balance
    }

    console.error(`invalid ERC-20 return value received: ${balance}`)
    throw new InvalidERC20CallReturnValueError('balanceOf')
}
