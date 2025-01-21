#!/usr/bin/env sh

# Assumption: No anoma node is running

set -e

./test-init-count-zero.sh
./test-init-increment-count-one.sh
echo "ALL Simple Counter tests passed"
