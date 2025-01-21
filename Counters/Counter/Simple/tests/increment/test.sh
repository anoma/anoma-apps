#!/usr/bin/env bash

# Assumption: No anoma node is running

set -e

ANOMA_DEBUG=""
make_dir=../../

make -C $make_dir anoma-start
sleep 1
make -C $make_dir counter-initialize
sleep 2
make -C $make_dir counter-increment
sleep 2
make -C $make_dir counter-get
make -C $make_dir anoma-stop
diff -w out $make_dir/anoma-build/GetCount.result
echo "test passed"
