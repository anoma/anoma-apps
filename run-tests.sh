#!/usr/bin/env bash

parallel --line-buffer --tag --joblog parallel-timings.log \
  'TMPDIR=$(mktemp -d); trap "XDG_CONFIG_HOME=$TMPDIR juvix dev anoma stop || true; rm -rf $TMPDIR" EXIT; \
   cd {1} && XDG_CONFIG_HOME=$TMPDIR ./all-tests.sh 2>&1 | tee all-tests.log' \
  ::: HelloWorld/tests SimpleHelloWorld/tests Counters/Counter/Simple/tests Counters/Counter/Unique/tests Kudos/tests

