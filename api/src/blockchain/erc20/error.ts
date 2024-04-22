
export class InvalidERC20CallReturnValueError extends Error {
    constructor(callName: string) {
        const msg = `invalid return value received from ERC-20 ${callName}() call`
        super(msg)

        Object.setPrototypeOf(this, InvalidERC20CallReturnValueError.prototype)
    }
}
