#!/usr/bin/env bash

red () {
    local arg
    read -r arg
    printf "\e[31m%s\e[0m\n" "$arg"
}

green () {
    local arg
    read -r arg
    printf "\e[32m%s\e[0m\n" "$arg"
}

bold () {
    local arg
    read -r arg
    printf "\e[1m%s\e[0m\n" "$arg"
}

test_passed () {
   printf "Test passed\e[0m\n"
}

wait_for_anoma_start () {
    local predicate
    local make_dir
    make_dir=$(dirname "${BASH_SOURCE[0]}")/..
    predicate=$(printf 'make -s -C %s latest-block-height > /dev/null' $make_dir)
    poll "$predicate"
}

assert_balance () {
    local make_dir
    make_dir=$(dirname "${BASH_SOURCE[0]}")/..
    local line=$1
    local assert_owner=$2
    local expected_balance=$3
    local actual_balance
    local get_balance_output=$make_dir/anoma-build/GetBalance.proved.txt
    make -C $make_dir get-balance owner-id="$assert_owner"
    printf "**** Asserting that '%s' has balance '%s'\e[0m\n" "$assert_owner" "$expected_balance"
    actual_balance=$(sort < "$get_balance_output")
    if test "$actual_balance" != "$expected_balance"
    then
        printf "Failed. line: %s\n" "$line" | bold | red
        printf "Owner: '%s':\n\tExpected '%s'\n\tActual '%s'\n" "$assert_owner" "$expected_balance" "$actual_balance"
        exit 1
    fi
}

assert_broke () {
    local make_dir
    make_dir=$(dirname "${BASH_SOURCE[0]}")/..
    local line=$1
    local assert_owner=$2
    local get_balance_output=$make_dir/anoma-build/GetBalance.proved.txt
    local actual_balance
    make -C $make_dir get-balance owner-id="$assert_owner"
    printf "**** Asserting that the balance of '%s' is empty\n" "$assert_owner" | bold
    actual_balance=$(sort < "$get_balance_output")
    if test "$actual_balance" != ""
    then
        printf "Failed. line: %s\n" "$line" | bold | red
        printf "Owner: '%s':\n\tExpected <empty>\n\tActual '%s'\n" "$assert_owner" "$actual_balance"
        exit 1
    fi
}

poll () {
    local predicate
    local timeout
    # predicate is a command. The poll succeeds if the predicate returns exit code 0.
    predicate=$1
    timeout=${2:-5}
    start=$(date +"%s")
    while test $(date +'%s') -lt $(($start + $timeout))
    do
        echo "$predicate"
        if eval "$predicate"
        then
            return 0
        fi
    done
    echo "$predicate - timed out"
    return 1
}

wait_for_transaction () {
    local block_height
    local predicate
    local make_dir
    make_dir=$(dirname "${BASH_SOURCE[0]}")/..
    block_height=$1
    predicate=$(printf 'test "true" = $(make -s -C %s block-height=%s has-transaction-after-height)' $make_dir $block_height)
    poll "$predicate"
}

kudos_initialize () {
    # arguments: owner_id, quantity
    local make_dir
    make_dir=$(dirname "${BASH_SOURCE[0]}")/..
    block_height=$(make -s -C $make_dir latest-block-height)
    make -C $make_dir kudos-initialize owner-id="$owner_id" quantity=$quantity
    wait_for_transaction $block_height
}

kudos_transfer () {
    # arguments: owner_id, receiver_id
    local make_dir
    make_dir=$(dirname "${BASH_SOURCE[0]}")/..

    block_height=$(make -s -C $make_dir latest-block-height)
    make -C $make_dir kudos-transfer owner-id="$owner_id" receiver-id="$receiver_id"
    wait_for_transaction $block_height
}

kudos_merge () {
    # arguments: owner_id, merge_id, receiver_id
    local make_dir
    make_dir=$(dirname "${BASH_SOURCE[0]}")/..

    block_height=$(make -s -C $make_dir latest-block-height)
    make -C $make_dir kudos-merge owner-id=$owner_id merge-id=$merge_id receiver-id=$receiver_id
    wait_for_transaction $block_height
}

kudos_split () {
    # arguments: spec
    local make_dir
    make_dir=$(dirname "${BASH_SOURCE[0]}")/..
    printf "Kudos Split\n" | bold

    block_height=$(make -s -C $make_dir latest-block-height)
    make --makefile makefile-split -C "$make_dir" kudos-split split-spec="$spec"
    wait_for_transaction $block_height
}
