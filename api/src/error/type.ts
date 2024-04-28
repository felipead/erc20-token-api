
// Inspired by https://grpc.io/docs/guides/status-codes/
export enum ErrorType {
    Unauthenticated = 'UNAUTHENTICATED',
    PermissionDenied = 'PERMISSION_DENIED',
    InvalidArgument = 'INVALID_ARGUMENT',
    NotFound = 'NOT_FOUND',
    FailedPrecondition = 'FAILED_PRECONDITION',
    ResourceExhausted = 'RESOURCE_EXHAUSTED',
    AlreadyExists = 'ALREADY_EXISTS',
    Internal = 'INTERNAL',
    Unavailable = 'UNAVAILABLE',
    DeadlineExceeded = 'DEADLINE_EXCEEDED',
    Unknown = 'UNKNOWN'
}
