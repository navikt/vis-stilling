FROM ghcr.io/navikt/baseimages/node-express:16

WORKDIR /var

COPY build/ build/
COPY server/build server/build/
COPY server/node_modules server/node_modules/

WORKDIR /var/server/build

EXPOSE 3000

ENTRYPOINT ["node", "server.js"]
