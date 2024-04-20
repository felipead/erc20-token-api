FROM node:20.12.2-alpine3.19
WORKDIR /usr/api

COPY package.json package-lock.json ./
RUN npm install

COPY src/ tsconfig.json ./
COPY schema.graphql ./
RUN npm run build

ENTRYPOINT ["node", "./build/index.js"]
EXPOSE 80/tcp
