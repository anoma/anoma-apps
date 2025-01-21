#!/usr/bin/env bash

# Assumption: There is no running anoma node

set -e

ANOMA_DEBUG=""
make_dir=../../

make -C $make_dir anoma-start
sleep 2
make -C $make_dir add-transaction
sleep 2
make -C $make_dir get-message
sleep 2
make -C $make_dir anoma-stop
diff -w out $make_dir/anoma-build/last-message.txt
echo "test passed"
