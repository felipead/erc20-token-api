FROM node:20.12.2-alpine3.19
WORKDIR /usr/api

ENV GRAPHQL_API_PORT 80

# we use curl for the HEALTHCHECK
RUN apk add --update curl && \
    rm -rf /var/cache/apk/* && \
    curl --version

COPY package.json package-lock.json ./
RUN npm install

COPY tsconfig.json ./
COPY schema.graphql ./
COPY src/ ./
RUN npm run build

ENTRYPOINT ["node", "./build/index.js"]
EXPOSE 80/tcp

HEALTHCHECK --interval=5s --timeout=60s --start-period=2s \
    CMD curl --silent --fail "http://localhost:${GRAPHQL_API_PORT}/health" || exit 1
