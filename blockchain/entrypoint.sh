#!/bin/sh
set -e

echo "----------- RELEASE THE KRAKEN -----------"
echo

echo "----------- starting clef ----------------"
echo "${CLEF_MASTER_PASSWORD}" | clef \
  --keystore /mount/keystore \
  --configdir /mount/clef \
  --signersecret /mount/clef/masterseed.json \
  --chainid "${CHAIN_ID}" \
  --ipcpath /var/clef \
  --nousb \
  --suppress-bootwarn &

while [ ! -S /var/clef/clef.ipc ]; do
  echo "waiting for the clef IPC socket to be available at ..."
  sleep 1
done

echo "----------- starting geth ----------------"
geth --networkid "${CHAIN_ID}" \
  --signer /var/clef/clef.ipc \
  --datadir /mount/datadir/node1 \
  --keystore /mount/keystore \
  --syncmode "full" \
  --nodiscover \
  --ipcdisable \
  --http \
  --http.addr "0.0.0.0" \
  --http.vhosts '*' \
  --http.port 8545
