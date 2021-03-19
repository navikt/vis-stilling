FROM navikt/node-express:14-alpine

WORKDIR /var

COPY build/ build/
COPY server/ server/

WORKDIR /var/server
RUN npm ci
RUN npm run build

EXPOSE 3000

ENTRYPOINT ["node", "server.js"]
