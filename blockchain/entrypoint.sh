#!/bin/sh
set -e

echo "----------- RELEASE THE KRAKEN -----------"
echo

# The processes below should be managed by supervisord, which will help ensure
# that if any of them restarts the container will remain operational
# See: http://supervisord.org

echo "----------- starting clef ----------------"

# For production, we would probably want to run clef in a more advanced manner
# and enable rules. See: https://github.com/ethereum/go-ethereum/blob/master/cmd/clef/tutorial.md
echo "${CLEF_MASTER_PASSWORD}" | clef \
  --keystore /mount/keystore \
  --configdir /mount/clef \
  --signersecret /mount/clef/masterseed.json \
  --chainid "${CHAIN_ID}" \
  --ipcpath /var/clef \
  --nousb \
  --suppress-bootwarn &

while [ ! -S /var/clef/clef.ipc ]; do
  echo "waiting for the clef IPC socket to be available ..."
  sleep 1
done

echo "----------- starting geth ----------------"

# We are booting geth with clef integration. It will serve an RPC API over HTTP.
# In a production environment, we should be concerned about enabling API
# authentication using the --authrpc options and JWT.
#
# Also, we should encrypt the transport by enabling SSL (TLS). As geth does
# not support SSL natively we could do that using Nginx.
# See: https://ethereum.stackexchange.com/questions/26026/how-to-ssl-ethereum-geth-node
geth --networkid "${CHAIN_ID}" \
  --signer /var/clef/clef.ipc \
  --datadir /usr/datadir/node1 \
  --keystore /mount/keystore \
  --syncmode "full" \
  --nodiscover \
  --ipcdisable \
  --http \
  --http.addr "0.0.0.0" \
  --http.vhosts "${GETH_HTTP_VHOSTS}" \
  --http.port 8545
