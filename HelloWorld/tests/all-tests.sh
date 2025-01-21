#!/usr/bin/env sh

pushd message
./tests.sh
popd

echo "All HelloWorld tests passed"
