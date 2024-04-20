#!/bin/bash

query='query {
  erc20_token_balance(token_address: "0x0000000000000000000000000000000000001111", addresses: ["0xD87d2676B8bbd7d4bf7884089356F7BB82158cFe","0xb92f2d4B7aBD0aC3936A757FDb6413aaC03372e6"]) {
    address
    balance
  }
}'

npx gq http://localhost:4000/graphql -q "$query"
