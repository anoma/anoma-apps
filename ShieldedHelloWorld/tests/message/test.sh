#!/usr/bin/env bash

# Assumption: There is no running anoma node

set -ex

main_dir=../../
build_dir=$main_dir/anoma-build
mkdir -p $build_dir

juvix dev anoma start --anoma-dir $ANOMA_PATH --force
sleep 2
juvix compile anoma $main_dir/HelloWorld.juvix -o $build_dir/HelloWorld.nockma
juvix compile cairo $main_dir/HelloWorldResourceLogic.juvix -o $build_dir/HelloWorldResourceLogic.json
juvix dev anoma prove $build_dir/HelloWorld.nockma -o $build_dir/HelloWorld.proved.nockma --arg bytes-unjammed:$build_dir/HelloWorldResourceLogic.json
sleep 2
juvix dev anoma add-transaction $build_dir/HelloWorld.proved.nockma --shielded
sleep 2
juvix compile anoma $main_dir/GetMessage.juvix -o $build_dir/GetMessage.nockma
curl -X GET localhost:4000/indexer/unspent-resources | jq -r '.unspent_resources[-1] // error("no messages exist")' | tail -n 1 > $build_dir/unspent-resources.txt
juvix dev anoma prove $build_dir/GetMessage.nockma -o $build_dir/GetMessage.proved.nockma --arg 'base64:unspent-resources.txt'
juvix dev nockma encode --cue --from bytes --to bytes < anoma-build/GetMessage.proved.nockma > $build_dir/last-message.txt
sleep 2
juvix dev anoma stop
diff -w out $build_dir/last-message.txt
echo "test passed"
