import { BaseError } from './base.js'
import { ErrorType } from './type.js'

export class UnknownError extends BaseError {
    constructor(msg: string, innerError?: Error) {
        super(ErrorType.Unknown, msg, innerError)
    }
}

export class InvalidArgument extends BaseError {
    constructor(msg: string, innerError?: Error) {
        super(ErrorType.InvalidArgument, msg, innerError)
    }
}
