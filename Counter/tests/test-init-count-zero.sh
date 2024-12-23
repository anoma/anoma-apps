#!/usr/bin/env sh

# Assumption: A fresh node has been started using "make run-node"
#
set -e

make -C ../ counter-initialize
sleep 1
make -C ../ get-count
diff -w test-init-count-zero.txt ../anoma-build/GetCount.result
echo "test passed"
