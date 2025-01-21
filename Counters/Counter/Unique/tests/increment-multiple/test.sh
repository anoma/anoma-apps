#!/usr/bin/env bash

# Assumption: No anoma node is running

set -e

ANOMA_DEBUG=""
make_dir=../../

make -C $make_dir anoma-start
sleep 1
make -C $make_dir counter_id=0 create-consumable-resource
sleep 1
make -C $make_dir counter_id=0 counter-initialize
sleep 1
make -C $make_dir counter_id=0 counter-increment
make -C $make_dir counter_id=0 counter-get

make -C $make_dir counter_id=1 create-consumable-resource
sleep 1
make -C $make_dir counter_id=1 counter-initialize
sleep 1
make -C $make_dir counter_id=1 counter-increment
make -C $make_dir counter_id=1 counter-increment
make -C $make_dir counter_id=1 counter-get

make -C $make_dir anoma-stop
diff -w out-0 $make_dir/anoma-build/GetCount-0.result
diff -w out-1 $make_dir/anoma-build/GetCount-1.result
echo "test passed"
