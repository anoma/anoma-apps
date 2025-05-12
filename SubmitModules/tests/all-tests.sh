#!/usr/bin/env bash

set -e

./submit.sh
./submit-local.sh

printf "\e[1;32mALL submission tests passed\e[0m\n"
