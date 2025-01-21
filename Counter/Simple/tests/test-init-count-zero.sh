#!/usr/bin/env sh

-- TODO fix tests

# Assumption: A fresh node has been started using "make run-node"
#
set -e

make -C ../ counter-initialize
sleep 1
make -C ../ counter-get
diff -w test-init-count-zero.txt ../anoma-build/GetCount.result
echo "test passed"
