FROM gcr.io/distroless/nodejs20-debian12:nonroot

WORKDIR /var

COPY dist/ build/
COPY server/build server/build/
COPY server/node_modules server/node_modules/

WORKDIR /var/server/build

EXPOSE 3000
CMD ["server.js"]
