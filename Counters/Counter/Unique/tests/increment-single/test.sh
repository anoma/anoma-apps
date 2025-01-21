#!/usr/bin/env sh

# Assumption: No anoma node is running

set -e

make_dir=../../

make -C $make_dir anoma-start
sleep 1
make -C $make_dir counter_id=0 create-consumable-resource
sleep 1
make -C $make_dir counter_id=0 counter-initialize
sleep 1
make -C $make_dir counter_id=0 counter-increment
sleep 1
make -C $make_dir counter_id=0 counter-get
make -C $make_dir anoma-stop
diff -w out $make_diranoma-build/GetCount-0.result
echo "test passed"
