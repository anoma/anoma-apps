#!/usr/bin/env bash

set -eu

original_pwd=$(pwd)
trap 'cd $original_pwd' EXIT
test_dir="$(dirname ${BASH_SOURCE[0]})"

cd "$test_dir"

source "../assert.sh"

ANOMA_DEBUG=""
make_dir=../../
bob=bob
apple=apple
bag=bag
wibble=wibble

make -C $make_dir anoma-start
sleep 1

owner_id=$apple quantity=1 kudos_initialize
assert_balance $LINENO $apple "$apple : 1"

owner_id=$apple receiver_id=$wibble kudos_transfer
assert_broke $LINENO $apple
assert_balance $LINENO $wibble "$apple : 1"

owner_id=$bag quantity=1 kudos_initialize
assert_balance $LINENO $bag "$bag : 1"

owner_id=$bag receiver_id=$bob kudos_transfer
assert_broke $LINENO $bag
assert_balance $LINENO $bob "$bag : 1"

block_height=$(make -s -C $make_dir latest-block-height)
spec="$(pwd)/swap-bob.yaml" kudos_swap_add_intent
spec="$(pwd)/swap-wibble.yaml" kudos_swap_add_intent
wait_for_transaction $block_height

test_passed
