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

port = $(anoma-build-dir)/port
host = $(anoma-build-dir)/host

$(anoma-build):
	@mkdir -p $(anoma-build-dir)
	@touch $(anoma-build)

.PHONY: clean
clean:
	@juvix clean
	@rm -rf $(anoma-build-dir)

.PHONY: start-anoma
start-anoma:
	@juvix dev anoma start --anoma-dir $(ANOMA_PATH)

.PHONY: stop-anoma
stop-anoma:
	@juvix dev anoma stop

$(config): $(anoma-build)
	@juvix dev anoma print-config > $(config)

.PHONY: add-transaction
add-transaction: $(proved) $(config)
	@juvix dev anoma -c $(config) add-transaction $(proved)

.PHONY: get-message
get-message: $(get-message-nockma) $(config) $(last-unspent-resource)
	@juvix dev anoma -c $(config) prove $(get-message-nockma) -o $(get-message-proved) --arg 'base64:$(last-unspent-resource)'
	@juvix dev nockma encode --cue --from bytes --to bytes < anoma-build/GetMessage.proved.nockma

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