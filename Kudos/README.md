## Kudos

### Dependencies

1. [Anoma node](https://github.com/anoma/anoma)

This should be cloned at commit `96b89b5ab11dd57e14349ff56555884491bb0d3d` and
the [setup instrucions](https://github.com/anoma/anoma?tab=readme-ov-file#compilation-from-sources) should be followed.

2. [Juvix compiler nightly](https://github.com/anoma/juvix-nightly-builds/releases/tag/nightly-2025-02-13-0.6.9-8b06157
)


Download the nightly binary for your platform at the link and put it on your system PATH.

3. make

On macOS this is part of the Xcode command line tools which can be installed using:

``` sh
xcode-select --install
```

4. [yq](https://mikefarah.gitbook.io/yq)

``` sh
brew install yq
```

5. [jq](https://jqlang.org)

``` sh
brew install yq
```

## Running tests

To check you have everything working run the tests:

```
cd tests && ANOMA_PATH=<path to Anoma checkout> ./all-tests.sh
```

There are tests for each kind of Kudos operation:

* [Initialize](tests/initialize/test.sh)
* [Merge](tests/merge/test.sh)
* [Split](tests/split/test.sh)
* [Transfer / Swap](tests/swap/test.sh)

## Kudos Examples

There are `makefile` targets for each of the Kudos operations. All of the commands in this section should be run from the directory that contains this README file.

Before you use the Kudos operations you must start Anoma:

``` sh
make anoma-start
```

Running this command again will reset the Anoma state.

### Initialize

Initialize creates some quantity of Kudos owned by some identity. 

For example, the following command creates 2 Kudos owned by `alice`:

``` sh
make kudos-initialize owner-id=alice quantity=2
```

When this command is run an Kudos identity for `alice` (i.e a ed25519 keypair) is generated.

Identities are generated as required by the `makefile` target and persist until you run `make clean`.

### Check balance

To check the total kudos balance for an owner use the `get-balance` target.

Continuing the example we can check alice's balance:

``` sh
make -s get-balance owner-id=alice
```

This should display:

``` sh
alice : 2
```

### Transfer

To transfer the latest created Kudos resource from one owner to another use `kudos-transfer`

Continuing the example we can transfer the 2 `alice` kudos to a new identity: `bob`:

``` sh
make kudos-transfer owner-id=alice receiver-id=bob
```

and now check bob's balance:

``` sh
make -s get-balance owner-id=bob
```

you should now see that bob has 2 `alice` kudos:

``` sh
alice : 2
```

Bob can also create their own kudos:

``` sh
make kudos-initialize owner-id=bob quantity=5
```

and check their new balance:

``` sh
make -s get-balance owner-id=bob
```

you should now see:

``` sh
bob : 5
alice : 2
```

### Merge

To merge all kudos resources of a particular type into a single resource use the `kudos-merge` target.

Continuing the example, say bob wants to send 7 `bob` kudos to alice. He already has 5 `bob` kudos and so could create 2 more `bob` kudos, merge all `bob` kudos into a single resource and then transfer them to alice:

1. Create 2 more `bob` kudos:

``` sh
make kudos-initialize owner-id=bob quantity=2
```

2. Merge all of bob's `bob` kudos into a single resource and send them to alice:

``` sh
make kudos-merge owner-id=bob merge-id=alice receiver-id=alice
```

3. alice now has 7 `bob` kudos:

``` sh
make -s get-balance owner-id=alice
```

displays:

``` sh
bob : 7
```

### Split

Split is used to split a quantity of kudos among 2 recipients.

To continue the example, say alice wants to give 3 more kudos to bob and 4 kudos to eve.

1. alice creates 7 kudos:

``` sh
make kudos-initialize owner-id=alice quantity=7
```

2. create `split.yaml` file which declares the partition of `alice` kudos:

``` yaml
owner: alice
partition:
    bob: 3
    eve: 4
```

3. Use `kudos-split` to make the split:

``` sh
make --makefile=makefile-split kudos-split split-spec=split.yaml
```

4. Check the balances after the split

i. Check alice's balance:

``` sh
make -s get-balance owner-id=alice
```

alice only has `bob` kudos, all their `alice` kudos have been transfered:

``` sh
bob : 7
```

ii. Check bob's balance:

``` sh
make -s get-balance owner-id=bob
```

bob has 3 additional `alice` kudos, bringing their total to `5`:

``` sh
alice : 5
```

iii. Check eve's balance

``` sh
make -s get-balance owner-id=eve
```

eve has 4 `alice` kudos:

``` sh
alice : 4
```

### Direct Swap Intents

The `kudos-swap` target is used to swap kudos between two parties:

To continue the example, say:

* eve wants to swap their 4 `alice` kudos for 7 `bob` kudos
* alice wants to swap their 7 `bob` kudos for 4 `alice` kudos

1. create `swap-eve.yaml` for eve and `swap-alice.yaml` for alice, describing
   their intents:

`swap-eve.yaml`:

```yaml
owner: eve
want:
    symbol: bob
    quantity: 7
give:
    symbol: alice
    quantity: 4
```

`swap-alice.yaml`:

```yaml
owner: alice
want:
    symbol: alice
    quantity: 4
give:
    symbol: bob
    quantity: 7
```

2. Submit a swap intents for eve and alice:

``` sh
make --makefile=makefile-swap list-intents swap-spec=swap-eve.yaml
make --makefile=makefile-swap add-intent swap-spec=swap-alice.yaml
```

Anoma then solves these intents and performs the transfer:

3. Check the balances

i. Check alice's balance

``` sh
make -s get-balance owner-id=alice
```

alice now has 4 `alice` kudos:

``` sh
alice : 4
```

ii. Check eve's balance


``` sh
make -s get-balance owner-id=eve
```

and eve now has 7 `bob` kudos:

``` sh
bob : 7
```
