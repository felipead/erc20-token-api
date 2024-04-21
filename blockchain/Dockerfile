FROM ethereum/client-go:alltools-release-1.13

ENV CHAIN_ID 21
ENV CLEF_MASTER_PASSWORD please-load-the-master-password-in-the-environment

VOLUME /mount/clef
VOLUME /mount/keystore
VOLUME /mount/datadir

COPY genesis.json ./
RUN geth \
    --datadir /mount/datadir/node1 \
    --keystore /mount/keystore \
    --networkid "${CHAIN_ID}" \
    init genesis.json

RUN mkdir -p /var/clef

COPY entrypoint.sh /usr/entrypoint.sh
RUN chmod +x /usr/entrypoint.sh

ENTRYPOINT /usr/entrypoint.sh

EXPOSE 8545/tcp
