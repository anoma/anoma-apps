#!/usr/bin/env bash

set -e

TMPDIR=$(mktemp -d)

juvix compile anoma SubmitLocalModules.juvix -o $TMPDIR/SubmitLocalModules.nockma
juvix dev anoma prove $TMPDIR/SubmitLocalModules.nockma --arg bytes:$1 -o $TMPDIR/SubmitLocalModules.proved.nockma
rm -rf $TMPDIR
