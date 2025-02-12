#!/usr/bin/env bash

set -e

pushd initialize
./test.sh
popd

pushd merge
./test.sh
popd

pushd split
./test.sh
popd

printf "\e[1;32mALL Kudos tests passed\e[0m\n"
