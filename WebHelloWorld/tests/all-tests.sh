#!/usr/bin/env bash

set -e

pushd message
./test.sh
popd

echo "All WebHelloWorld tests passed"
