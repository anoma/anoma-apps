# dependencies:
# 	- jq
# 	- yq
# 	- grpcurl

# How to run:
# 0. set ANOMA_PATH environment variable to the folder where anoma is cloned and compiled (branch origin/artem/juvix-node-integration-v0.28)
# 1. make anoma-start # start the Anoma node
# 3. make add-transaction # Submit the HelloWorld transaction to anoma
# 4. make get-message # Get the message from the latest HelloWorld Resource
# ...
# 4. make anoma-stop # stop the Anoma node when you've finished
ANOMA_PATH ?= $(error set the ANOMA_PATH variable to a path to an anoma clone)
base-path = .
base = HelloWorld
get-message = GetMessage

anoma-build-dir = anoma-build
anoma-build = $(anoma-build-dir)/.exists

config = $(anoma-build-dir)/config.yaml

juvix = $(base-path)/$(base).juvix
nockma = $(anoma-build-dir)/$(base).nockma
proved = $(anoma-build-dir)/$(base).proved.nockma

get-message-juvix = $(base-path)/$(get-message).juvix
get-message-nockma = $(anoma-build-dir)/$(get-message).nockma
get-message-proved = $(anoma-build-dir)/$(get-message).proved.nockma

last-unspent-resource = $(anoma-build-dir)/last-unspent-resources
last-message-txt = $(anoma-build-dir)/last-message.txt

port = $(anoma-build-dir)/port
host = $(anoma-build-dir)/host

$(anoma-build):
	@mkdir -p $(anoma-build-dir)
	@touch $(anoma-build)

.PHONY: clean
clean:
	@juvix clean
	@rm -rf $(anoma-build-dir)

.PHONY: anoma-start
anoma-start:
ifdef ANOMA_DEBUG
	cd $(ANOMA_PATH) && \
		mix run --no-halt $(root)/../../start-config.exs
else
	juvix dev anoma start --anoma-dir $(ANOMA_PATH)
endif

.PHONY: anoma-stop
anoma-stop:
ifdef ANOMA_DEBUG
	@echo "ANOMA_DEBUG is incompatible with anoma-stop" && false
else
	juvix dev anoma stop
endif

$(config): $(anoma-build)
	@juvix dev anoma print-config > $(config)

.PHONY: add-transaction
add-transaction: $(proved) $(config)
	@juvix dev anoma -c $(config) add-transaction $(proved)

.PHONY: get-message
get-message: $(last-message-txt)
	@cat $(last-message-txt)

.PHONY: $(last-message-txt)
$(last-message-txt): $(get-message-nockma) $(config) $(last-unspent-resource)
	@juvix dev anoma -c $(config) prove $(get-message-nockma) -o $(get-message-proved) --arg 'base64:$(last-unspent-resource)'
	@juvix dev nockma encode --cue --from bytes --to bytes < anoma-build/GetMessage.proved.nockma > $(last-message-txt)

$(nockma): $(juvix) $(anoma-build)
	@juvix compile anoma $(juvix) -o $(nockma)

$(proved): $(nockma) $(config)
	@juvix dev anoma -c $(config) prove $(nockma) -o $(proved)

$(get-message-nockma): $(anoma-build) $(get-message-juvix)
	@juvix compile anoma $(get-message-juvix) -o $(get-message-nockma)

.PHONY: $(last-unspent-resource)
$(last-unspent-resource): $(anoma-build) $(host) $(port)
	@grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.IndexerService.ListUnspentResources | jq -r '.unspentResources[-1] // error("no messages exist")' > $(last-unspent-resource)

$(host): $(config)
	@yq -r '.url' $(config) | tr -d '\n' > $(host)

$(port): $(config)
	@yq -r '.port' $(config) | tr -d '\n' > $(port)
