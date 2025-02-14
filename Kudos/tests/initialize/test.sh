#!/usr/bin/env bash

set -eu

original_pwd=$(pwd)
trap 'cd $original_pwd' EXIT

cd "$(dirname "${BASH_SOURCE[0]}")"

source "../assert.sh"

ANOMA_DEBUG=""
make_dir=../../
bob=bob
quantity=12

make -C $make_dir anoma-start
wait_for_anoma_start
owner_id=$bob quantity=$quantity kudos_initialize
assert_balance $LINENO $bob "$bob : $quantity"
echo "test passed"
