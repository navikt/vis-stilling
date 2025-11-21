FROM gcr.io/distroless/nodejs24-debian12
ENV NODE_ENV=production

# Set cache directory to writable location
ENV NEXT_CACHE_DIR=/tmp/.next/cache
# Disable additional cache mechanisms that might cause mkdir errors
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DISABLE_CACHE=1

WORKDIR /app

COPY .next/standalone /app/
COPY .next/static ./.next/static

USER nonroot

EXPOSE 3000

CMD ["server.js"]