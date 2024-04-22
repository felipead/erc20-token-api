
const requireString = (key: string): string => {
    const value = process.env[key]
    if (value) {
        return value
    }
    throw new Error(`Could not load ${key} from the environment, or it has an empty value`)
}

const requireInt = (key: string): number => {
    const value = requireString(key)
    return parseInt(value)
}

export const GRAPHQL_API_PORT = requireInt('GRAPHQL_API_PORT')
export const ETHEREUM_BLOCKCHAIN_ENDPOINT = requireString('ETHEREUM_BLOCKCHAIN_ENDPOINT')
