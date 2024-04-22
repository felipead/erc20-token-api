# EthZ - Tech Assignment

At Kraken we engage with a wide variety of blockchains. To ensure efficiency, we aim to standardize and optimize interfacing with various blockchain ecosystems.\
This assignment tests your skills in setting up blockchain nodes and creating APIs for blockchain interactions.

## Instructions

Build a dockerized setup that includes:
- A `geth` node configured with a provided `genesis.json` for a private network
- A Blockchain API
- An API client

### Blockchain API
Develop a service exposing an API to:
- **Fetch ERC20 token information**
    - Parameters: 1 token address
    - Response: token name, symbol, decimals
- **Fetch ERC20 token balances**
    - Parameters: 1 token address, 1 or more addresses to retrieve balances for
    - Response: Token balance for each address

API may be implemented using REST, GraphQL or any other you deem appropriate.

### API Client
Develop a basic client for your API and use it to print, at startup, the following to standard output (stdout):
- The token balance for each ethereum address in `addresses.json`. Format: `<address>: <amount> <symbol>`
- The total token balance for each user in `addresses.json`. Format: `<user name>: <amount> <symbol>`

**Note:** The amount is expected in a human-readable format accounting for the token’s decimal precision, such as 1.234 ETH.\
Please ensure adherence to the expected format as entries from stdout will be automatically compared against a pre-determined set for validation. One entry per line, in any order.

## Provided Resources
- `genesis.json`: Configuration for a private go-ethereum (`geth`) node network. Tested with `geth` version `1.13.14`, but feel free to use any version.
    - contains an already deployed ERC20 Token at address `0x0000000000000000000000000000000000001111` with balances for some addresses.
- `addresses.json`: A set of user addresses for this network.

## Requirements
Running `docker compose up --build` **MUST**:
- Start a service exposing an API accessible from the host to query token data described in [Blockchain API](#blockchain-api).
- Print the expected output described in [Api Client](#api-client) to `stdout`.

Regardless of the API you choose to implement, document it using industry standards (e.g. OpenAPI/Swagger for a RESTful API).

## Language
You may use TypeScript (TS) or Rust for this assignment. The choice of language will not impact the review of your application.

## Submitting Your Results
Compress your source code into a ZIP archive and send us a link where we can download it. Dropbox or Google Drive sharing has worked well in the past. Ensure the `docker-compose.yml` file is on the top level of your submission.

**Note:** This assignment does not detail every single aspect you should consider. This intentional ambiguity is to assess your ability to analyze a problem and devise a sound, safe approach independently.
