#!/usr/bin/env bash

-e

pushd message
./tests.sh
popd

echo "All HelloWorld tests passed"
