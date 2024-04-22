FROM ethereum/client-go:alltools-release-1.13

ENV CHAIN_ID 21
ENV CLEF_MASTER_PASSWORD please-load-the-master-password-in-the-environment

# configure the --http.vhosts option for geth
# for security reasons, we should NOT wildcard it using '*'
ENV GETH_HTTP_VHOSTS blockchain

VOLUME /mount/clef
VOLUME /mount/keystore

# we are building the datadir inside the container just for the purpose of this exercise
# running a full-fledge Ethereum node will require a blazing fast SSD with hundreds of Gibabytes available
# so we would probably want to mount the datadir as a Docker volume too
RUN mkdir -p /usr/datadir/node1

COPY genesis.json ./
RUN geth \
    --datadir /usr/datadir/node1 \
    --keystore /mount/keystore \
    --networkid "${CHAIN_ID}" \
    init genesis.json

RUN mkdir -p /var/clef

COPY entrypoint.sh /usr/entrypoint.sh
RUN chmod +x /usr/entrypoint.sh

ENTRYPOINT /usr/entrypoint.sh

EXPOSE 8545/tcp

HEALTHCHECK --interval=5s --timeout=120s --start-period=15s \
    CMD netstat -altn | grep '.8545' > /dev/null; if [ 0 != $? ]; then exit 1; fi;
