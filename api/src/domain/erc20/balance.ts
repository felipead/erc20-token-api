import { Decimal } from 'decimal.js'

export const tokenBalanceToHumanReadable = (tokenBalance: bigint, decimals: number): string => {
    const precision = tokenBalance.toString().length + 1
    Decimal.set({ precision, rounding: Decimal.ROUND_HALF_UP })

    const exponent = Decimal.pow(10, decimals.toString())
    const shifted = new Decimal(tokenBalance.toString()).dividedBy(exponent)
    return shifted.toFixed(decimals)
}
