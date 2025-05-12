#!/usr/bin/env bash

set -eu

original_pwd=$(pwd)
trap 'cd $original_pwd' EXIT

cd "$(dirname "${BASH_SOURCE[0]}")"

TMPDIR=$(mktemp -d)

juvix dev anoma start --force --anoma-dir $ANOMA_PATH
juvix compile anoma Main.juvix --modular -o $TMPDIR/Main.nockma
cd ..
scripts/submit-modules.sh $TMPDIR/Main.modules.nockma
cd -
juvix dev anoma prove $TMPDIR/Main.nockma -o $TMPDIR/Main.proved.nockma
RESULT=$(cat $TMPDIR/Main.proved.nockma | juvix dev nockma encode --from bytes --to text)
juvix dev anoma stop

if test "$RESULT" != "5"
then
    printf "Module submission test failed (node storage)"
    exit 1
fi

echo "test passed (node storage)"
