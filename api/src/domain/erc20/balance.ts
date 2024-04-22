import { Decimal } from 'decimal.js'

export const tokenBalanceToHumanReadable = (tokenBalance: bigint, decimals: number, totalSupply: bigint): string => {
    const precision = totalSupply.toString().length
    Decimal.set({ rounding: Decimal.ROUND_HALF_UP, precision: precision })

    const exponent = Decimal.pow(10, decimals.toString())
    const shifted = new Decimal(tokenBalance.toString()).dividedBy(exponent)
    return shifted.toFixed(decimals)
}
