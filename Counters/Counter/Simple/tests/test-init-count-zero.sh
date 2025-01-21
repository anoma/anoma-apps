#!/usr/bin/env sh

# Assumption: No anoma node is running

set -e

make -C ../ anoma-start
sleep 1
make -C ../ counter-initialize
sleep 1
make -C ../ counter-get
make -C ../ anoma-stop
diff -w test-init-count-zero.txt ../anoma-build/GetCount.result
echo "test passed"
