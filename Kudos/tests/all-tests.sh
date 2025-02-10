#!/usr/bin/env bash

set -e

pushd initialize
./test.sh
popd

pushd merge
./test.sh
popd

echo "ALL Kudos tests passed"
