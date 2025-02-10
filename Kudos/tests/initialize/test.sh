#!/usr/bin/env bash

set -eu

original_pwd=$(pwd)
trap 'cd $original_pwd' EXIT

cd "$(dirname "${BASH_SOURCE[0]}")"

. "../assert.sh"

# ANOMA_DEBUG=""
make_dir=../../
bob=bob
quantity=12

# make -C $make_dir anoma-start
# sleep 1
#
i=0
total_quantity=0
while true
do
    printf "****TEST NUMBER: %s *****\n" $i
    i=$(echo "$i + 1" | bc)
    total_quantity=$(echo "$total_quantity + $quantity" | bc)
    latest_block_height=$(make -s -C $make_dir latest-block-height)
    make -C $make_dir kudos-initialize owner-id=$bob quantity=$quantity
    predicate=$(printf 'test "true" = $(make -s -C %s block-height=%s has-transaction-after-height)' $make_dir $latest_block_height)
    poll "$predicate"
    assert_balance $LINENO $bob "$bob : $total_quantity"
done
echo "test passed"
