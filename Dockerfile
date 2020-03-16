FROM navikt/node-express:12.2.0-alpine

WORKDIR /app

COPY build/ build/
COPY server/ server/

WORKDIR /app/server
RUN npm install

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "start.sh"]
