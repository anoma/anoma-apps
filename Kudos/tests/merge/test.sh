#!/usr/bin/env bash

set -eu

original_pwd=$(pwd)
trap 'cd $original_pwd' EXIT

cd "$(dirname "${BASH_SOURCE[0]}")"

. "../assert.sh"

ANOMA_DEBUG=""
make_dir=../../
bob=bob
caracalla=caracalla
wibble=wibble
quantity_1=12
quantity_2=2
expected_merge_quantity=$(echo "$quantity_1 + $quantity_2" | bc)
wait_time=1

make -C $make_dir anoma-start
sleep $wait_time
make -C $make_dir kudos-initialize owner-id=$caracalla quantity=$quantity_1
sleep $wait_time
assert_balance $LINENO caracalla "$caracalla : $quantity_1"
make -C $make_dir kudos-transfer owner-id=$caracalla receiver-id="$bob"
sleep $wait_time
assert_balance $LINENO "$bob" "$caracalla : $quantity_1"
make -C $make_dir kudos-initialize owner-id=$caracalla quantity=$quantity_2
sleep $wait_time
assert_balance $LINENO $caracalla "$caracalla : $quantity_2"
make -C $make_dir kudos-transfer owner-id=$caracalla receiver-id="$bob"
sleep $wait_time
assert_balance $LINENO "$bob" "$caracalla : $expected_merge_quantity"
make -C $make_dir kudos-merge owner-id=$bob merge-id=$caracalla receiver-id=$wibble
sleep $wait_time
assert_balance $LINENO $wibble "$caracalla : $expected_merge_quantity"
echo "test passed"
