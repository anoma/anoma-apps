#!/usr/bin/env bash

# Assumption: No anoma node is running

set -x

make anoma-start
sleep 1
curl -X GET $(cat anoma-build/host):$(cat anoma-build/port)/indexer/root
make counter-initialize
sleep 2
curl -X GET $(cat anoma-build/host):$(cat anoma-build/port)/indexer/root -H "accept: application/json" -H "Content-Type: application/json"
make anoma-stop
