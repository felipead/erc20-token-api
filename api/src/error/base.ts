import { ErrorType } from './type.js'

export interface ApplicationError extends Error {
    readonly name: string
    readonly type: ErrorType
    readonly message: string

    isRetryable(): boolean
}

export abstract class BaseError extends Error implements ApplicationError {
    public readonly name: string
    public readonly type: ErrorType
    public innerError: Error | Error[] | undefined

    public constructor(type: ErrorType, msg?: string, innerError?: Error | Error[]) {
        super(msg)
        this.type = type
        this.name = this.constructor.name
        this.innerError = innerError
    }

    public isRetryable(): boolean {
        switch (this.type) {
            case ErrorType.DeadlineExceeded:
            case ErrorType.Unavailable:
                return true
            default:
                return false
        }
    }

    public toJSON() {
        return {
            name: this.name,
            type: this.type.valueOf(),
            retryable: this.isRetryable(),
            message: this.message
        }
    }

    public toHTTPStatus(): number {
        switch (this.type) {
            case ErrorType.InvalidArgument:
                return 400
            case ErrorType.FailedPrecondition:
                return 400
            case ErrorType.Unauthenticated:
                return 401
            case ErrorType.PermissionDenied:
                return 403
            case ErrorType.NotFound:
                return 404
            case ErrorType.AlreadyExists:
                return 409
            case ErrorType.ResourceExhausted:
                return 429
            case ErrorType.Internal:
                return 500
            case ErrorType.Unavailable:
                return 503
            case ErrorType.DeadlineExceeded:
                return 504
            case ErrorType.Unknown:
            default:
                return 500
        }
    }
}
