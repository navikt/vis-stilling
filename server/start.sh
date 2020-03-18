#!/usr/bin/env sh

export APIGW_HEADER=$(cat /secret/apigw/x-nav-apiKey)

exec node server.js