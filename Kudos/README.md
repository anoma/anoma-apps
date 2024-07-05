# Scale-Free Kudos

Status: DRAFT

## How to run it

You need:

* A copy of the latest [juvix nightly build](https://github.com/anoma/juvix-nightly-builds/releases/latest)

* A clone of [anoma](https://github.com/anoma/anoma) checked out at branch: `paul/juvix-resource-test`

Then:

* Compile the `Example.juvix` with Juvix: `juvix compile anoma Example.juvix`

* Copy the output file `Example.nockma` to the root of the Anoma clone you made in the previous step: `cp Example.nockma $PATH_TO_ANOMA_CLONE/RawCounterTransaction.nockma`

* Run the test that verifies the transaction in Anoma: `mix test test/resource_test.exs:218`
