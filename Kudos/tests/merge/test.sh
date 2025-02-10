#!/usr/bin/env bash

set -eu

original_pwd=$(pwd)
trap 'cd $original_pwd' EXIT

cd "$(dirname "${BASH_SOURCE[0]}")"

source "../assert.sh"

ANOMA_DEBUG=""
make_dir=../../
bob=bob
caracalla=caracalla
wibble=wibble
quantity_1=12
quantity_2=2
expected_merge_quantity=$(($quantity_1 + $quantity_2))

make -C $make_dir anoma-start
sleep 1

owner_id=$caracalla quantity=$quantity_1 kudos_initialize
assert_balance $LINENO caracalla "$caracalla : $quantity_1"

owner_id=$caracalla receiver_id=$bob kudos_transfer
assert_balance $LINENO "$bob" "$caracalla : $quantity_1"

owner_id=$caracalla quantity=$quantity_2 kudos_initialize
assert_balance $LINENO $caracalla "$caracalla : $quantity_2"

owner_id=$caracalla receiver_id=$bob kudos_transfer
assert_balance $LINENO "$bob" "$caracalla : $expected_merge_quantity"

owner_id=$bob merge_id=$caracalla receiver_id=$wibble kudos_merge
assert_balance $LINENO $wibble "$caracalla : $expected_merge_quantity"

test_passed
