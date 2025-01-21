#!/usr/bin/env bash

# Assumption: No anoma node is running

set -e

pushd initialize
./test.sh
popd

pushd increment
./test.sh
popd

echo "ALL Simple Counter tests passed"
