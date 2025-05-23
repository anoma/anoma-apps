#!/usr/bin/env bash

set -eu

original_pwd=$(pwd)
trap 'cd $original_pwd' EXIT
test_dir="$(dirname ${BASH_SOURCE[0]})"

cd "$test_dir"

source "../assert.sh"

ANOMA_DEBUG=""
make_dir=../../
robin=robin
caracalla=caracalla
wibble=wibble
quantity_robin=4
quantity_caracalla=1
quantity_wibble=3

make -C $make_dir anoma-start
sleep 1

owner_id=$robin quantity=$quantity_robin kudos_initialize
sleep 3
assert_balance $LINENO $robin "$robin : $quantity_robin"

spec="$(pwd)/split.yaml" kudos_split
sleep 3
assert_balance $LINENO $caracalla "$robin : $quantity_caracalla"
assert_balance $LINENO $wibble "$robin : $quantity_wibble"
assert_broke $LINENO $robin

make -C $make_dir anoma-stop

test_passed
