#!/usr/bin/env bash

set -x

make anoma-start
sleep 2
make message="Hello World!" add-transaction
sleep 2

# Fetch the first unspent resource
curl -X GET $(cat anoma-build/host):$(cat anoma-build/port)/indexer/unspent-resources | jq '.unspent_resources[0]' | tr -d '"' > anoma-build/res.nockma

# Compute resource kind
juvix compile anoma GetKind.juvix -o anoma-build/GetKind.nockma
juvix dev anoma prove anoma-build/GetKind.nockma -o anoma-build/kind.nockma --arg base64:anoma-build/res.nockma

# Filter resources by kind
echo "{\"filters\": [{\"kind\": \"$(cat anoma-build/kind.nockma | juvix dev nockma encode --from bytes --cue --to base64)\"}]}" > anoma-build/filter-request.json
curl -X POST $(cat anoma-build/host):$(cat anoma-build/port)/indexer/filter-resources -H "accept: application/json" -H "Content-Type: application/json" -d @- < anoma-build/filter-request.json

# Stop the node
juvix dev anoma stop
