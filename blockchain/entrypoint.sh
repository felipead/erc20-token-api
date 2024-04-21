#!/bin/sh
set -e

echo "----------- RELEASE THE KRAKEN -----------"

echo "${CLEF_MASTER_PASSWORD}" | clef \
  --keystore /mount/keystore \
  --configdir /mount/clef \
  --signersecret /mount/clef/masterseed.json \
  --chainid "${CHAIN_ID}" \
  --ipcpath /var/clef \
  --nousb \
  --suppress-bootwarn &

# FIXME: use a netcat on a clef port or wait for ICP lock to be available
sleep 20

echo "------- starting geth ------"
geth --networkid "${CHAIN_ID}" \
  --signer /var/clef/clef.ipc \
  --datadir /mount/datadir/node1 \
  --keystore /mount/keystore \
  --syncmode "full" \
  --nodiscover \
  --ipcdisable \
  --http \
  --http.addr "0.0.0.0" \
  --http.port 8545
