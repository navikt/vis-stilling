FROM navikt/node-express:14-alpine

WORKDIR /var

COPY build/ build/
COPY server/build server/build/
COPY server/node_modules server/build/node_modules/

WORKDIR /var/server/build

EXPOSE 3000

ENTRYPOINT ["node", "server.js"]
