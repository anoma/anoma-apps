# How to Set, Get and Update Values in the Anoma Node Key-Value Store

## Dependencies

### Anoma Node

Install [Anoma Node](https://github.com/anoma/anoma). The `base` branch should work but these instructions were tested with Anoma Node release v0.21.0.

Assuming you've installed the [Anoma Node dependencies](https://github.com/anoma/anoma?tab=readme-ov-file#dependencies)
and you are authorized to clone the [Anoma Node repository](https://github.com/anoma/anoma) run:

```shell
git clone https://github.com/anoma/anoma
git checkout v0.21.0
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

## Setting the value of a key

### The Juvix module

Say we want to set the value of the key `["August"; "Water"; "Miki"]` to `1`. We can write the following module:

SetKey.juvix
```
module SetKey;

import Stdlib.Prelude open;

main : Pair (List String) Nat := (["August"; "Water"; "Miki"], 1);
```

Then compile this module with Juvix:

```shell
juvix compile anoma SetKey.juvix
```

This will produce a file called `SetKey.nockma`.

### Workaround wrapping closure

Anoma Node expects the transaction to be wrapped in a closure. We can do this with the following script. We're currently investigating this, in the meantime you need to use the following workaround:

NB: on macOS you'll need to install GNU sed using [`brew install gnu-sed`](https://formulae.brew.sh/formula/gnu-sed) and use the command `gsed` instead of `sed`.

```shell
sed -i -e '1i [[1' -e '$a ]0]' SetKey.nockma
```

### Submit to Anoma Node

Run the following command from the root of the Anoma Node clone:

```shell
mix client submit SetKey.nockma
```

The shell prompt will return on success.

## Getting the value of a key

NB: You need to wait for the SetKey transaction to complete before trying to get the value of the key.

### The Juvix module

Say we want to get the value of the key we just set `["August"; "Water"; "Miki"]`, we can write the following module.

NB: The package containing the module must depend on [`juvix-anoma-stdlib`](https://github.com/anoma/juvix-anoma-stdlib).

GetKey.juvix
```
module GetKey;

import Stdlib.Prelude open;
import Anoma open;

main : Nat := anomaGet ["August"; "Water"; "Miki"];
```

Then compile this module with Juvix:

```shell
juvix compile anoma GetKey.juvix
```

This will produce a file called `GetKey.nockma`.

### Workaround wrapping closure

In a similar way to the workaround in SetKey we need to wrap this output in a closure.

```
sed -i -e '1i [[1' -e '$a ]0]' GetKey.nockma
```

### Submit to Anoma Node

Run the following command from the root of the Anoma Node clone:

```shell
mix client ro-submit GetKey.nockma
```

The shell prompt will return the value of the key on success.

## Updating the value of a key

Say we want to increment the value of the key `["August"; "Water"; "Miki"]` by 1, we can write the following module.

NB: The package containing the module must depend on [`juvix-anoma-stdlib`](https://github.com/anoma/juvix-anoma-stdlib).

```
module UpdateKey;

import Stdlib.Prelude open;
import Anoma open;

main : Pair (List String) Nat :=
  let
    key : List String := ["August"; "Water"; "Miki"];
  in key, anomaGet key + 1;
```

Then compile this module with Juvix:

```shell
juvix compile anoma UpdateKey.juvix
```

This will produce a file called `UpdateKey.nockma`.

### Workaround wrapping closure

In a similar way to the workaround in SetKey we need to wrap this output in a closure.

```
sed -i -e '1i [[1' -e '$a ]0]' UpdateKey.nockma
```

### Submit to Anoma Node

Run the following command from the root of the Anoma Node clone:

```shell
mix client submit UpdateKey.nockma
```

The shell prompt will return on success.
