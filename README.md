# ERC-20 Token API

> At Kraken we engage with a wide variety of blockchains. To ensure efficiency, we aim to standardize and optimize interfacing with various blockchain ecosystems.
> This assignment tests your skills in setting up blockchain nodes and creating APIs for blockchain interactions.

Please read the original problem spec [here](/README.spec.md).

## The API

This API was built using GraphQL. You can read the API schema [here](/api/schema.graphql).

The API exposes two graphql queries, one for fetching ERC-20 token information, and another for fetching balances from multiple addresses. These queries can be combined per GraphQL capabilities.

Examples on how to query the API can be found [here](/api/examples).

## GraphQL vs. REST

GraphQL has the following advantages over REST:

- It has an intuitive, readable and powerful schema language
- It lets clients define how they want to query the API
- It allows queries to be combined, reducing overall latency
- Because it is schema-based, it has built-in query validation

The disadvantages of using GraphQL are:

- It doesn't have a wide support as REST. It is cumbersome to be used with command-line tools (eg: `curl`).
- It doesn't enforce that HTTP status codes are respected. It also doesn't enforce common status codes. This can make it harder to distinguish user errors from server errors (eg: `400 Bad Request` vs `500 Internal Server Error`), and also transient errors (eg: `503 Service Unavailable`).
- Because a typical GraphQL API only exposes one `/graphql` URL, it is not straightforward to cache requests as you can by following REST's uniform interface.

### Validation

GraphQL offers some schema validation, but that is obviously not enough to protect an API against rogue requests.

Because of time constraints, and for the sake of the exercise, we are not validating query request parameters. This must be addressed before we run this service in production.

### Security

This implementation does not add any authentication or authorization protections to the API. This also must be addressed before we ship to production.

For authentication, we can leverage a technology like OAuth2, JWT or even something simple but effective like Basic Auth over TLS (HTTPS).

For authorization, the business requirements are vague. We might only want to allow an address to be queried by a user that owns it, for example.  

### Error handling

There are two types of errors we need to be concerned about:

- Errors caused by a request or user input. For example, if the API receives address that does not exist. In that case, we should return an appropriate error message (and status code), instead of failing with a cryptic error message.
- Transient errors. For example, network or transport errors, server unavailability or even errors in the Blockchain. Some of these errors can be safely and easily retried. Others cannot (blindly retrying transactions could cause _double spending_, among other examples).   

Due to lack of time, this was not implemented.

## The Blockchain

We are running a private Ethereum blockchain using [geth](https://geth.ethereum.org).

For the purpose of this exercise, we only configured one node, and no miners. If this were production, we would certainly need to configure more nodes and also run miners to process transactions and create new blocks.

The blockchain was configured using [clef](https://geth.ethereum.org/docs/tools/clef/introduction). The newest `geth` versions already deprecate the personal account management in favor of `clef`.

The current setup has many serious security concerns and vulnerabilities, which were not addressed for the sake of this exercise.

### `clef` security concerns

For the sake of this exercise, we already initialized an example clef `mastersecret.json` and also a _keystore_ with an account. 

> ⚠️ **WARNING**: the secret files and passwords included in this repository are for testing purposes only, and should NEVER be used in production.

In order for the container to access these files, two Docker volumes are defined:

- `/mount/clef` - for the `masterscret.json`
- `/mount/keystore` - for the account keys 

> ⚠️ **WARNING**: these volumes must be mounted into a highly-secure encrypted filesystem. Anyone with access to those volumes would be able to subvert accounts and compromise funds in the Blockchain.

We are passing `clef`'s master password as an environment variable. This however, is _not_ the safest approach. There are more secure alternatives, such as Docker secrets, AWS KMS, encrypted files, etc...

See:
   - https://blog.diogomonica.com//2017/03/27/why-you-shouldnt-use-env-variables-for-secret-data/
   - https://www.netmeister.org/blog/passing-passwords.html

### `geth` security concerns

We are booting `geth` with `clef` integration. It will serve an RPC API over HTTP. In a production environment, we should be concerned about enabling API authentication using the `--authrpc` options and JWT.

Also, we should encrypt the transport by enabling TLS / SSL. As `geth` does not support SSL natively we could do that using [nginx](https://www.nginx.com). See: https://ethereum.stackexchange.com/questions/26026/how-to-ssl-ethereum-geth-node

## Performance considerations

The following could be implemented to improve performance and reduce latency:

### `geth` nodes and the `datadir` 

The `datadir` is the directory where `geth` nodes store the [blockchain data](https://geth.ethereum.org/docs/fundamentals/databases) in the filesystem. 

We are building the Blockchain `datadir` inside the container just for the purpose of this exercise. Running a full-fledged production Ethereum node would require a blazing fast SSD with hundreds of Gibabytes available. 

For production, we would probably want to mount the `datadir` as an external Docker volume too.

### Processing requests in parallel

The API that fetches balances accepts multiple addresses. For each address, we must make a call to the `balanceOf` ERC-20 method. That could imply in huge latency if we were to query many addresses sequentially.

We are already fetching balance requests concurrently, using node.js async capabilities.

### Caching

Some ERC-20 methods will never change. For example, the `name()`, `symbol()`, and `decimals()` are expected to stay constant among the entire lifecycle of token in the Blockchain. It makes sense to cache this information.

The key to the cache would be the token address. We could use an in-memory cache with an LRU strategy, or even adopt a distributed cache like [redis](https://redis.io). We could even mix both strategies - check the in-memory cache first, then check redis, in true L1/L2 spirit. 

In the blockchain world, some token methods might consume gas fees. So caching makes sense not only from a performance perspective, but from an economics one.  

However, caching mutable properties can be challenging. For example, we could cache balances. But what if the balance changes as a result of a new transaction? Detecting these events and invalidating our cache could be tricky.

In the case of balances though, it might be the case that the business scenario could tolerate a small delay. We could cache the balances only for a few seconds, quickly invalidating and refreshing the cache after that. 

## Availability considerations

The following could be implemented to improve availability:

### Run multiple Blockchain nodes

Running multiple `geth` nodes would greatly improve availability and partition tolerance.

We could use [nginx](https://www.nginx.com) as a reverse proxy to distribute the load from the API between the nodes. In the incident one node is down, the others will catch up and requests will be re-routed.

### Sticky sessions

Because of the nature of the Blockchain, it might take some time for the nodes to sync on the latest nodes. 

When load balancing requests between multiple nodes, it could be the case that they see different states of the Blockchain. If these requests are part of the same feature, the feature could break.

One common solution to this problem is to use sticky sessions in the reverse proxy. That way, we can ensure requests are grouped to the same node if they share the same session. 

`nginx` supports sticky sessions in their Plus plan.

### Use `supervisord`

Because we are not leveraging a service like AWS ECS or Kubernetes, we must address the case where the processes inside the container could simply crash. [supervisord](http://supervisord.org) is a great tool we could use to manage these processes and ensure they are up and running.

### Run multiple instances of the API

We might also want to run multiple instances of the API server container. These can be behind a reverse proxy as well (again, `nginx`), and the clients would only interface with the load balancer. 
