FROM node:20.12.2-alpine3.19
WORKDIR /usr/api

COPY package.json package-lock.json ./
RUN npm install

COPY src/ tsconfig.json ./
RUN npm run build

ENTRYPOINT ["node", "./build/index.js"]
