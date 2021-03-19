FROM navikt/node-express:14-alpine

WORKDIR /var

COPY build/ build/
COPY server/server.js server/server.js

EXPOSE 3000

ENTRYPOINT ["node", "server.js"]
