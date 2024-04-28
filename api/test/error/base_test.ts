import test from 'ava'

import { BaseError } from '../../src/error/base.js'
import { ErrorType } from '../../src/error/type.js'

class FoobarError extends BaseError {
    constructor(type: ErrorType) {
        super(type, 'foobar error')
    }
}

test('map error type to HTTP status', t => {
    t.is(new FoobarError(ErrorType.InvalidArgument).toHTTPStatus(), 400)
    t.is(new FoobarError(ErrorType.FailedPrecondition).toHTTPStatus(), 400)
    t.is(new FoobarError(ErrorType.Unauthenticated).toHTTPStatus(), 401)
    t.is(new FoobarError(ErrorType.PermissionDenied).toHTTPStatus(), 403)
    t.is(new FoobarError(ErrorType.NotFound).toHTTPStatus(), 404)
    t.is(new FoobarError(ErrorType.AlreadyExists).toHTTPStatus(), 409)
    t.is(new FoobarError(ErrorType.ResourceExhausted).toHTTPStatus(), 429)
    t.is(new FoobarError(ErrorType.Internal).toHTTPStatus(), 500)
    t.is(new FoobarError(ErrorType.Unavailable).toHTTPStatus(), 503)
    t.is(new FoobarError(ErrorType.DeadlineExceeded).toHTTPStatus(), 504)
    t.is(new FoobarError(ErrorType.Unknown).toHTTPStatus(), 500)
    t.is(new FoobarError('foobar' as never).toHTTPStatus(), 500)
})

test('map error type to "is retryable"', t => {
    t.is(new FoobarError(ErrorType.InvalidArgument).isRetryable(), false)
    t.is(new FoobarError(ErrorType.FailedPrecondition).isRetryable(), false)
    t.is(new FoobarError(ErrorType.Unauthenticated).isRetryable(), false)
    t.is(new FoobarError(ErrorType.PermissionDenied).isRetryable(), false)
    t.is(new FoobarError(ErrorType.NotFound).isRetryable(), false)
    t.is(new FoobarError(ErrorType.AlreadyExists).isRetryable(), false)
    t.is(new FoobarError(ErrorType.ResourceExhausted).isRetryable(), false)
    t.is(new FoobarError(ErrorType.Internal).isRetryable(), false)
    t.is(new FoobarError(ErrorType.Unavailable).isRetryable(), true)
    t.is(new FoobarError(ErrorType.DeadlineExceeded).isRetryable(), true)
    t.is(new FoobarError(ErrorType.Unknown).isRetryable(), false)
    t.is(new FoobarError('foobar' as never).isRetryable(), false)
})

test('build JSON dictionary', t => {
    t.deepEqual(new FoobarError(ErrorType.Unavailable).toJSON(), {
        name: 'FoobarError',
        type: 'UNAVAILABLE',
        retryable: true,
        message: 'foobar error'
    })

    t.deepEqual(new FoobarError(ErrorType.InvalidArgument).toJSON(), {
        name: 'FoobarError',
        type: 'INVALID_ARGUMENT',
        retryable: false,
        message: 'foobar error'
    })
})