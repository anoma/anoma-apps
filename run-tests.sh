#!/usr/bin/env bash
set -e

# Function to run tests in a single directory.
run_test() {
  local test_dir=$1
  echo "--------------------------------------------------"
  echo "Running tests in '${test_dir}'..."

  # Create a temporary directory
  local TMPDIR
  TMPDIR=$(mktemp -d)

  # Set a trap to perform cleanup on exit of the function.
  trap "XDG_CONFIG_HOME=${TMPDIR} juvix dev anoma stop || true; rm -rf ${TMPDIR}" EXIT

  # Change to the test directory and run the tests.
  pushd "${test_dir}" > /dev/null
  XDG_CONFIG_HOME=${TMPDIR} bash -c "set -o pipefail; ./all-tests.sh 2>&1 | tee all-tests.log"
  popd > /dev/null

  # Remove the temporary directory and clear the trap.
  trap - EXIT

  echo "Completed tests in '${test_dir}'."
  echo "--------------------------------------------------"
  echo
}

tests=(
  "HelloWorld/tests"
  "WebHelloWorld/tests"
  "Counters/Counter/Simple/tests"
  "Counters/Counter/Unique/tests"
  "Kudos/tests"
  "SubmitModules/tests"
)

for test in "${tests[@]}"; do
  run_test "$test"
done
