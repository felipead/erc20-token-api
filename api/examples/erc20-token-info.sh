#!/bin/bash

query='query {
  erc20_token_info(token_address: "0x0000000000000000000000000000000000001111") {
    name
    symbol
    decimals
  }
}'

npx gq http://localhost:4000/graphql -q "$query"
