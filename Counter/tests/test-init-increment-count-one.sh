#!/usr/bin/env sh

# Assumption: A fresh node has been started using "make run-node"

set -e

make -C ../ counter-initialize
sleep 2
make -C ../ counter-increment
sleep 2
make -C ../ get-count
diff -w test-init-increment-count-one.txt ../anoma-build/GetCount.result
echo "test passed"
