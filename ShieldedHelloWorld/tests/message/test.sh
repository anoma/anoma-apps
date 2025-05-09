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
# TODO: verify that the message was sent; this needs more support in the Anoma standard library
juvix dev anoma stop
echo "test passed"
