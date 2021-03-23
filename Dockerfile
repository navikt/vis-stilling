FROM navikt/node-express:14-alpine

WORKDIR /var

COPY build/ build/
COPY server/build server/build/
COPY server/node_modules server/node_modules/

WORKDIR /var/server/build

EXPOSE 3000

# Start app når Istio er klar:
# https://doc.nais.io/clusters/gcp/#starting-application-when-istio-proxy-is-ready
COPY --from=redboxoss/scuttle:latest /scuttle /bin/scuttle
ENV ENVOY_ADMIN_API=http://127.0.0.1:15000
ENV ISTIO_QUIT_API=http://127.0.0.1:15020

ENTRYPOINT ["scuttle", "node", "server.js"]
