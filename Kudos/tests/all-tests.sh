#!/usr/bin/env bash

set -e

printf "\n\e[1m%s\e[0m\n\n" "Running kudos initialize tests"
pushd initialize
./test.sh
popd

printf "\n\e[1m%s\e[0m\n\n" "Running kudos merge tests"
pushd merge
./test.sh
popd

printf "\n\e[1m%s\e[0m\n\n" "Running kudos split tests"
pushd split
./test.sh
popd

printf "\n\e[1m%s\e[0m\n\n" "Running kudos swap tests"
pushd swap
./test.sh
popd

printf "\e[1;32mALL Kudos tests passed\e[0m\n"
