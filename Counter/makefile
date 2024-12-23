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
anoma-path = ~/heliax/anoma
base-path = Simple
script-path = ../scripts

initialize = Initialize
increment = Increment
counter-logic = Logic

base64_to_atom = $(script-path)/base64_to_atom.py
make_args = $(script-path)/make_args.py
anoma-build = anoma-build

initialize-juvix = $(base-path)/$(initialize).juvix
initialize-nockma = $(anoma-build)/$(initialize).nockma
initialize-proved = $(anoma-build)/$(initialize).proved.nockma
initialize-args = $(anoma-build)/$(initialize).args

initialize-paul-proved = $(anoma-build)/$(initialize)-paul.proved.nockma
initialize-paul-candidate = $(anoma-build)/$(initialize)-paul.candidate.nockma
initialize-paul-candidate-text = $(initialize-paul-candidate).txt
initialize-paul-transaction-function-text = $(anoma-build)/$(initialize)-paul.transaction-function.nockma.txt

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

encode-logic-int = $(anoma-build)/encode-logic.int
encode-logic-text = $(anoma-build)//encode-logic.txt
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

.PHONY: encode-logic-clipboard-linux
encode-logic-clipboard-linux: $(encode-logic-int)
	cat $(encode-logic-int) | tr -d '\n' | xclip -selection clipboard

.PHONY: encode-logic-clipboard-mac
encode-logic-clipboard-mac: $(encode-logic-int)
	cat $(encode-logic-int) | tr -d '\n' | pbcopy

.PHONY: initialize-counter
counter-initialize: $(initialize-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(initialize-proved)

.PHONY: increment-counter
counter-increment: $(increment-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(increment-proved)

.PHONY: cat-config
cat-config: $(config)
	@cat $(config)

.PHONY: cat-transaction-function
cat-transaction-function: $(initialize-transaction-function-text)
	@cat $(initialize-transaction-function-text)

.PHONY: diff
diff: $(initialize-paul-transaction-function-text) $(initialize-transaction-function-text)
	delta $(initialize-paul-transaction-function-text) $(initialize-transaction-function-text)

.PHONY: cat-encode-logic-text
cat-encode-logic-text: $(encode-logic-text)
	@cat $(encode-logic-text)

.PHONY: cat-candidate
cat-candidate: $(initialize-candidate-text)
	@cat $(initialize-candidate-text)

# TODO Improve script or use JS/TS helpers.

$(host): $(config)
	@yq -r '.url' $(config) | tr -d '\n' > $(host)

$(port): $(config)
	@yq -r '.port' $(config) | tr -d '\n' > $(port)

$(unspent-resources-int): $(anoma-build) $(host) $(port)
	@grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.IndexerService.ListUnspentResources | jq -r 'try .unspentResources[]' | $(base64_to_atom) > $(unspent-resources-int)

$(get-latest-root-int): $(anoma-build) $(host) $(port)
	@grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.BlockService.Root | jq -r '.root' | $(base64_to_atom) > $(get-latest-root-int)

$(encode-logic-text): $(anoma-build) $(counter-logic-proved)
	juvix dev nockma encode --from bytes --to text < $(counter-logic-proved) > $(encode-logic-text)

$(encode-logic-int): $(anoma-build) $(counter-logic-proved)
	@base64 < $(counter-logic-proved) | $(base64_to_atom) > $(encode-logic-int)

$(initialize-args): $(anoma-build) $(encode-logic-int)
	$(make_args) $(encode-logic-int) > $(initialize-args)

$(increment-args): $(anoma-build) $(encode-logic-int) $(get-latest-root-int) $(unspent-resources-int)
	$(make_args) $(encode-logic-int) $(unspent-resources-int) $(get-latest-root-int) > $(increment-args)

$(anoma-build):
	@mkdir -p $(anoma-build)

$(config): $(anoma-build) $(anoma-config)
	@cp $(anoma-config) $(config)

$(initialize-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(initialize-juvix) -o $(initialize-nockma)

$(increment-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(increment-juvix) -o $(increment-nockma)

$(initialize-proved): $(initialize-args) $(initialize-nockma) $(config)
	juvix dev anoma -c $(config) prove $(initialize-nockma) -o $(initialize-proved) --args $(initialize-args)

$(increment-proved): $(increment-nockma) $(config) $(increment-args)
	juvix dev anoma -c $(config) prove $(increment-nockma) -o $(increment-proved) --args $(increment-args)

$(counter-logic-nockma): $(all-juvix)
	@juvix compile anoma $(counter-logic-juvix) -o $(counter-logic-nockma)

$(counter-logic-proved): $(counter-logic-nockma) $(config)
	@juvix dev anoma -c $(config) prove $(counter-logic-nockma) -o $(counter-logic-proved)

$(initialize-paul-candidate): $(initialize-paul-proved) $(config)
	juvix dev anoma -c $(config) prove $(initialize-paul-proved) -o $(initialize-paul-candidate)

$(initialize-paul-candidate-text): $(initialize-paul-candidate) $(config)
	juvix dev nockma encode --from bytes --to text < $(initialize-paul-candidate) > $(initialize-paul-candidate-text)

$(initialize-paul-transaction-function-text): $(initialize-paul-candidate-text)
	sed '0,/0/{s/0//}' $(initialize-paul-candidate-text) > $(initialize-paul-transaction-function-text)

$(initialize-candidate): $(initialize-proved) $(config)
	juvix dev anoma -c $(config) prove $(initialize-proved) -o $(initialize-candidate)

$(initialize-candidate-text): $(initialize-candidate) $(config)
	juvix dev nockma encode --from bytes --to text < $(initialize-candidate) > $(initialize-candidate-text)

$(initialize-transaction-function-text): $(initialize-candidate-text)
	sed '0,/0/{s/0//}' $(initialize-candidate-text) > $(initialize-transaction-function-text)
