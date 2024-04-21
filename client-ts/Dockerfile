FROM node:20.12.2-alpine3.19
WORKDIR /usr/client

COPY package.json package-lock.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./
RUN npm run build

ENTRYPOINT ["node", "./build/index.js"]
