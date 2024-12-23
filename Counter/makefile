# dependencies:
# 	- python3
# 	- jq
# 	- yq
# 	- grpcurl
# 	- base64
# how to run:
# - set anoma-path variable in this file to the folder where anoma is cloned and compiled (branch origin/artem/juvix-node-integration-v0.28)
# - make run-node # keep this running in a separate terminal
# - make encode-logic-clipboard-linux # then replace the value of valid-counter?-encoded in EncodedLogic.juvix
# - make counter-initialize
# TODO
anoma-path = ~/projects/anoma
base-path = Simple
script-path = ../scripts

initialize = Initialize
increment = Increment
get-count = GetCount
counter-logic = Logic

base64_to_atom = $(script-path)/base64_to_atom.py
anoma-build = anoma-build

initialize-juvix = $(base-path)/$(initialize).juvix
initialize-nockma = $(anoma-build)/$(initialize).nockma
initialize-proved = $(anoma-build)/$(initialize).proved.nockma
initialize-args = $(anoma-build)/$(initialize).args

initialize-candidate = $(anoma-build)/$(initialize).candidate.nockma
initialize-candidate-text = $(initialize-candidate).txt
initialize-transaction-function-text = $(anoma-build)/$(initialize).transaction-function.nockma.txt

increment-juvix = $(base-path)/$(increment).juvix
increment-nockma = $(anoma-build)/$(increment).nockma
increment-proved = $(anoma-build)/$(increment).proved.nockma
increment-args = $(anoma-build)/$(increment).args

counter-logic-juvix = $(base-path)/$(counter-logic).juvix
counter-logic-nockma = $(anoma-build)/$(counter-logic).nockma
counter-logic-proved = $(anoma-build)/$(counter-logic).proved.nockma

get-count-juvix = $(base-path)/$(get-count).juvix
get-count-nockma = $(anoma-build)/$(get-count).nockma
get-count-proved = $(anoma-build)/$(get-count).proved.nockma
get-count-args = $(anoma-build)/$(get-count).args
get-count-result = $(anoma-build)/$(get-count).result

unspent-resources = $(anoma-build)/unspent-resources
get-latest-root = $(anoma-build)/latest-root

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

.PHONY: run-node
run-node:
	cd $(anoma-path) && \
		mix run --no-halt $(root)/../start-config.exs

.PHONY: get-latest-root
get-latest-root: $(get-latest-root)
	@cat $(get-latest-root)

.PHONY: get-unspent-resources
get-unspent-resources: $(unspent-resources)
	@cat $(unspent-resources)

.PHONY: counter-initialize
counter-initialize: $(initialize-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(initialize-proved)

.PHONY: counter-increment
counter-increment: $(increment-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(increment-proved)

.PHONY: get-count
get-count: $(get-count-result)
	@cat $(get-count-result)
	@echo ""

.PHONY: cat-config
cat-config: $(config)
	@cat $(config)

.PHONY: cat-transaction-function
cat-transaction-function: $(initialize-transaction-function-text)
	@cat $(initialize-transaction-function-text)

.PHONY: cat-candidate
cat-candidate: $(initialize-candidate-text)
	@cat $(initialize-candidate-text)

# TODO Improve script or use JS/TS helpers.

$(host): $(config)
	@yq -r '.url' $(config) | tr -d '\n' > $(host)

$(port): $(config)
	@yq -r '.port' $(config) | tr -d '\n' > $(port)

.PHONY: $(unspent-resources)
$(unspent-resources): $(anoma-build) $(host) $(port)
	grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.IndexerService.ListUnspentResources | jq -r 'try .unspentResources[]' > $(unspent-resources)

.PHONY: $(get-latest-root)
$(get-latest-root): $(anoma-build) $(host) $(port)
	@grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.BlockService.Root | jq -r '.root' > $(get-latest-root)

$(anoma-build):
	@mkdir -p $(anoma-build)

$(config): $(anoma-build) $(anoma-config)
	@cp $(anoma-config) $(config)

$(initialize-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(initialize-juvix) -o $(initialize-nockma)

$(increment-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(increment-juvix) -o $(increment-nockma)

$(get-count-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(get-count-juvix) -o $(get-count-nockma)

$(initialize-proved): $(counter-logic-proved) $(initialize-nockma) $(config)
	juvix dev anoma -c $(config) prove $(initialize-nockma) -o $(initialize-proved) --arg "bytes:$(counter-logic-proved)"

$(increment-proved): $(increment-nockma) $(unspent-resources) $(get-latest-root) $(config) $(counter-logic-proved)
	juvix dev anoma -c $(config) prove $(increment-nockma) -o $(increment-proved) --arg "bytes:$(counter-logic-proved)" --arg "base64:$(unspent-resources)" --arg "base64:$(get-latest-root)"

$(get-count-proved): $(unspent-resources) $(get-count-nockma) $(config)
	juvix dev anoma -c $(config) prove $(get-count-nockma) -o $(get-count-proved) --arg "base64:$(unspent-resources)"

$(get-count-result): $(get-count-proved)
	juvix dev nockma encode --from bytes --to text < $(get-count-proved) > $(get-count-result)

$(counter-logic-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(counter-logic-juvix) -o $(counter-logic-nockma)

$(counter-logic-proved): $(counter-logic-nockma) $(config)
	juvix dev anoma -c $(config) prove $(counter-logic-nockma) -o $(counter-logic-proved)

$(initialize-candidate): $(initialize-proved) $(config)
	juvix dev anoma -c $(config) prove $(initialize-proved) -o $(initialize-candidate)

$(initialize-candidate-text): $(initialize-candidate) $(config)
	juvix dev nockma encode --from bytes --to text < $(initialize-candidate) > $(initialize-candidate-text)

$(initialize-transaction-function-text): $(initialize-candidate-text)
	sed '0,/0/{s/0//}' $(initialize-candidate-text) > $(initialize-transaction-function-text)
