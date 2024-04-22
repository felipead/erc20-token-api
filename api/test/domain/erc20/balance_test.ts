import test from 'ava'

import { tokenBalanceToHumanReadable } from '../../../src/domain/erc20/balance.js'

test('convert token balance to human readable (ZERO)', t => {
    const balance = BigInt(0)
    const decimals = 5
    const totalSupply = BigInt('18913469089218429310297331818')

    const humanReadable = tokenBalanceToHumanReadable(balance, decimals, totalSupply)

    t.is(humanReadable, '0.00000')
})

test('convert token balance to human readable (ONE)', t => {
    const balance = BigInt(1)
    const decimals = 5
    const totalSupply = BigInt('18913469089218429310297331818')

    const humanReadable = tokenBalanceToHumanReadable(balance, decimals, totalSupply)

    t.is(humanReadable, '0.00001')
})

test('convert token balance to human readable (medium number with some decimals)', t => {
    const balance = BigInt('123456')
    const decimals = 5
    const totalSupply = BigInt('18913469089218429310297331818')

    const humanReadable = tokenBalanceToHumanReadable(balance, decimals, totalSupply)

    t.is(humanReadable, '1.23456')
})

test('convert token balance to human readable (small number with many decimals)', t => {
    const balance = BigInt('123')
    const decimals = 18
    const totalSupply = BigInt('18913469089218429310297331818')

    const humanReadable = tokenBalanceToHumanReadable(balance, decimals, totalSupply)

    t.is(humanReadable, '0.000000000000000123')
})

test('convert token balance to human readable (very big number with some decimals)', t => {
    const balance = BigInt('996063082561531756934684337')
    const decimals = 7
    const totalSupply = BigInt('18913469089218429310297331818')

    const humanReadable = tokenBalanceToHumanReadable(balance, decimals, totalSupply)

    t.is(humanReadable, '99606308256153175693.4684337')
})

test('convert token balance to human readable (very big number with many decimals)', t => {
    const balance = BigInt('996063082561531756934684337')
    const decimals = 18
    const totalSupply = BigInt('18913469089218429310297331818')

    const humanReadable = tokenBalanceToHumanReadable(balance, decimals, totalSupply)

    t.is(humanReadable, '996063082.561531756934684337')
})

test('convert token balance to human readable (reaching total-supply precision)', t => {
    const balance = BigInt('18913469089218429310297331817')
    const decimals = 18
    const totalSupply = BigInt('18913469089218429310297331818')

    const humanReadable = tokenBalanceToHumanReadable(balance, decimals, totalSupply)

    t.is(humanReadable, '18913469089.218429310297331817')
})
