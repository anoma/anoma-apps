#!/usr/bin/env bash

assert_balance () {
    local make_dir
    make_dir=$(dirname "${BASH_SOURCE[0]}")/..
    local line=$1
    local assert_owner=$2
    local expected_balance=$3
    local actual_balance
    local get_balance_output=$make_dir/anoma-build/GetBalance.proved.txt
    make -C $make_dir get-balance owner-id="$assert_owner"
    printf "**** Asserting that '%s' has balance '%s'\n" "$assert_owner" "$expected_balance"
    actual_balance=$(sort < "$get_balance_output")
    if test "$actual_balance" != "$expected_balance"
    then
        printf "Failed. line: %s\n" "$line"
        printf "Owner: '%s':\n\tExpected '%s'\n\tActual '%s'\n" "$assert_owner" "$expected_balance" "$actual_balance"
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
