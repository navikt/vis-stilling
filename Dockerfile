FROM gcr.io/distroless/nodejs18-debian11

WORKDIR /var

COPY build/ build/
COPY server/build server/build/
COPY server/node_modules server/node_modules/

WORKDIR /var/server/build

EXPOSE 3000
CMD ["server.js"]
