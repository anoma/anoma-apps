# How to Submit a Transaction to an Anoma Node

## Dependencies

### Anoma Node

Install [Anoma Node](https://github.com/anoma/anoma) using branch: `marari-paul/juvix-resource-submission`.

Assuming you've installed the [Anoma Node dependencies](https://github.com/anoma/anoma?tab=readme-ov-file#dependencies)
and you are authorized to clone the [Anoma Node repository](https://github.com/anoma/anoma) run:

```shell
git clone https://github.com/anoma/anoma
git checkout marari-paul/juvix-resource-submission
mix deps.get
mix compile
```

### Juvix

Download a copy of the [Juvix nightly build binary](https://github.com/anoma/juvix-nightly-builds/releases/latest)
for you computer's architecture and copy this somewhere on your environment's `PATH`.

## Running the Anoma Node

In the directory containing the Anoma Node clone run:

```shell
MIX_ENV=prod mix run --no-halt
```

## Compiling an Anoma Transaction

An Anoma transaction is defined using the [`Transaction`](https://github.com/anoma/juvix-anoma-stdlib/blob/b91e93a7582a7ac87e7756e39c28affc05926dca/Anoma/Transaction.juvix#L78) type.

A Juvix module that compiles to an Anoma transaction must contain a function called `main` with type `Transaction`:


MyTransaction.juvix
```
module MyTransaction;

-- Add https://github.com/anoma/juvix-anoma-stdlib as a dependency in the Juvix project `Package.juvix`
import Anoma open;

main : Transaction := ...
```

Such a module can then be compiled using `juvix`:

```shell
juvix compile anoma MyTransaction.juvix
```

The result is a file called `MyTransaction.nockma`, this is the file that should be submitted to the Anoma Node.


### Simple Counter Application Example

To compile [`SimpleCounter.juvix`](./SimpleCounter/SimpleCounter.juvix) to an Anoma transaction run:

```shell
juvix compile anoma SimpleCounter/SimpleCounter.juvix
```

The result is a file called `SimpleCounter.nockma`.

## Submitting a Transaction to the Anoma Node

To submit a transaction to the Anoma Node use the `mix client rm-submit` tool.
This command must be run from the Anoma Node root directory.

Pass the path to a `.nockma` file you produced with the `juvix compile anoma` command.

For example, to submit the `SimpleCounter.nockma` file from the previous section run:

```shell
mix client rm-submit PATH_TO_ANOMA_APPS_CLONE_DIR/SimpleCounter.nockma
```

The tool currently provides no feedback to the user.
