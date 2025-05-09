#!/usr/bin/env bash

set -e

TMPDIR=$(mktemp -d)

juvix compile anoma SubmitModules.juvix -o $TMPDIR/SubmitModules.nockma
juvix dev anoma prove $TMPDIR/SubmitModules.nockma --arg bytes:$1 -o $TMPDIR/SubmitModules.proved.nockma
juvix dev anoma add-transaction $TMPDIR/SubmitModules.proved.nockma
rm -rf $TMPDIR
