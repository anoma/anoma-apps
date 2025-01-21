#!/usr/bin/env sh

# Assumption: There is no running anoma node

set -e

ANOMA_DEBUG=""

make -C ../ anoma-start
sleep 2
make -C ../ add-transaction
sleep 2
make -C ../ get-message
sleep 2
make -C ../ anoma-stop
diff -w test-hello-world.txt ../anoma-build/last-message.txt
echo "test passed"
