#!/usr/bin/env sh

# Assumption: No anoma node is running

set -e

pushd initialize
./test.sh
popd

pushd increment-single
./test.sh
popd

pushd increment-multiple
./test.sh
popd

echo "ALL Unique Counter tests passed"
