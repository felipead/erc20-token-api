
const requireString = (key: string): string => {
    const value = process.env[key]
    if (value) {
        return value
    }
    throw new Error(`Could not load ${key} from the environment, or it has an empty value`)
}

export const GRAPHQL_API_ENDPOINT = requireString('CLIENT_GRAPHQL_API_ENDPOINT')