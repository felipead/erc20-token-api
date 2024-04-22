FROM ethereum/client-go:alltools-release-1.13

ENV CHAIN_ID 21

# For the purposes of this exercise, we are passing clef's master password as an
# environment variable. This however, is NOT the safest approach. There are more
# secure alternatives, such as Docker secrets, AWS KMS, encrypted files, etc...
#
# See:
#   - https://blog.diogomonica.com//2017/03/27/why-you-shouldnt-use-env-variables-for-secret-data/
#   - https://www.netmeister.org/blog/passing-passwords.html
ENV CLEF_MASTER_PASSWORD please-load-the-master-password-in-the-environment

# Configure the --http.vhosts option for geth
# For security reasons, we should NEVER wildcard it using '*'
ENV GETH_HTTP_VHOSTS blockchain

# The clef mastersecret and keystore volumes must be mounted into a highly
# secure encrypted filesystem. Anyone with access to those volumes would be
# able to subvert accounts and compromise funds
VOLUME /mount/clef
VOLUME /mount/keystore

# We are building the datadir inside the container just for the purpose of this
# exercise. Running a full-fledged production Ethereum node would require a
# blazing fast SSD with hundreds of Gibabytes available. So we would probably
# want to mount the datadir as a Docker volume too.
RUN mkdir -p /usr/datadir/node1

# For the purposes of this exercise, we are only booting one Ethereum node.
# However, for higher availability, partition tolerance and better load-balancing
# it is advisable to have more than one node.
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

# The health check here is simple. It only checks if geth's HTTP API is
# listening on the TCP port. For production we might want to add more checks,
# or even adopt container or ethereum node monitoring solution.
HEALTHCHECK --interval=5s --timeout=120s --start-period=15s \
    CMD netstat -altn | grep '.8545' > /dev/null; if [ 0 != $? ]; then exit 1; fi;
