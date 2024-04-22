import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'


const __dirname = dirname(fileURLToPath(import.meta.url))
export const API_SCHEMA = loadSchemaSync(join(__dirname, '..', 'schema.graphql'), {
    loaders: [new GraphQLFileLoader()]
})
