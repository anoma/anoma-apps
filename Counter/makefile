# dependencies:
# 	- python3
# 	- jq
# 	- yq
# 	- grpcurl
# 	- base64
# how to run:
# 0. set anoma-path variable in this file to the folder where anoma is cloned and compiled (branch origin/artem/juvix-node-integration-v0.28)
# 1. make run-client
# 2. make run-node # keep this running in a separate terminal
# 3. make add-transaction
anoma-path = ~/heliax/anoma
base-path = Simple/
script-path = ../scripts/

initialize = Initialize
increment = Increment
counter-logic = Logic

base64_to_atom = $(script-path)/base64_to_atom.py
anoma-build = anoma-build

juvix1 = $(base-path)/$(initialize).juvix
nockma1 = $(anoma-build)/$(initialize).nockma
proved1 = $(anoma-build)/$(initialize).proved.nockma

juvix2 = $(base-path)/$(increment).juvix
nockma2 = $(anoma-build)/$(increment).nockma
proved2 = $(anoma-build)/$(increment).proved.nockma

counter-logic-juvix = $(base-path)/$(counter-logic).juvix
counter-logic-nockma = $(anoma-build)/$(counter-logic).nockma
counter-logic-proved = $(anoma-build)/$(counter-logic).proved.nockma

encode-logic-int = $(anoma-build)/encode-logic.int
unspent-resources-int = $(anoma-build)/unspent-resources.int
get-latest-root-int = $(anoma-build)/latest-root.int

root = $(shell pwd)
config = $(anoma-build)/config.yaml
anoma-config = $(anoma-path)/config.yaml

port = $(anoma-build)/port
host = $(anoma-build)/host

all-juvix = $(shell find . -name '*.juvix')

.PHONY: clean
clean:
	juvix clean
	rm -rf $(anoma-build)

.PHONY: run-client
run-client:
	juvix dev anoma start --anoma-dir $(anoma-path)

.PHONY: run-node
run-node:
	cd $(anoma-path) && \
		mix run --no-halt $(root)/../start-config.exs

.PHONY: get-latest-root
get-latest-root: $(get-latest-root-int)
	@cat $(get-latest-root-int)

.PHONY: get-unspent-resources
get-unspent-resources: $(unspent-resources-int)
	@cat $(unspent-resources-int)

.PHONY: encode-logic
encode-logic: $(encode-logic-int)
	@cat $(encode-logic-int)

.PHONY: initialize-counter
initialize-counter: $(proved1) $(config)
	juvix dev anoma -c $(config) add-transaction $(proved1)

.PHONY: increment-counter
increment-counter: $(proved2) $(config)
	juvix dev anoma -c $(config) add-transaction $(proved2)

# TODO Improve script or use JS/TS helpers.

$(host): $(config)
	@yq -r '.url' $(config) | tr -d '\n' > $(host)

$(port): $(config)
	@yq -r '.port' $(config) | tr -d '\n' > $(port)

$(unspent-resources-int): $(anoma-build) $(host) $(port)
	@grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.IndexerService.ListUnspentResources | jq -r 'try .unspentResources[]' | $(base64_to_atom) > $(unspent-resources-int)

$(get-latest-root-int): $(anoma-build) $(host) $(port)
	@grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.BlockService.Root | jq -r '.root' | $(base64_to_atom) > $(get-latest-root-int)

$(encode-logic-int): $(anoma-build) $(counter-logic-proved)
	@base64 < $(counter-logic-proved) | $(base64_to_atom) > $(encode-logic-int)

$(anoma-build):
	@mkdir -p $(anoma-build)

$(config): $(anoma-config)
	@cp $(anoma-config) $(config)

$(nockma1): $(all-juvix)
	juvix compile anoma $(juvix1) -o $(nockma1)

$(nockma2): $(all-juvix)
	juvix compile anoma $(juvix2) -o $(nockma2)

$(proved1): $(nockma1) $(config)
	juvix dev anoma -c $(config) prove $(nockma1) -o $(proved1)

$(proved2): $(nockma2) $(config)
	juvix dev anoma -c $(config) prove $(nockma2) -o $(proved2)

$(counter-logic-nockma): $(all-juvix)
	@juvix compile anoma $(counter-logic-juvix) -o $(counter-logic-nockma)

$(counter-logic-proved): $(counter-logic-nockma) $(config)
	@juvix dev anoma prove $(counter-logic-nockma) -o $(counter-logic-proved)
