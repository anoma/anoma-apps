ANOMA_PATH ?= $(error set the ANOMA_PATH variable to a path to an anoma clone)
base-path = .
base = HelloWorld
get-message = GetMessage
root = $(shell pwd)

ifneq ($(XDG_CONFIG_HOME),)
    juvix-cmd = XDG_CONFIG_HOME=$(XDG_CONFIG_HOME) juvix
else
    juvix-cmd = juvix
endif

anoma-build-dir = anoma-build
anoma-build = $(anoma-build-dir)/.exists

config = $(anoma-build-dir)/config.yaml

temp-file := $(anoma-build-dir)/temp_line

juvix = $(base-path)/$(base).juvix
nockma = $(anoma-build-dir)/$(base).nockma
proved = $(anoma-build-dir)/$(base).proved.nockma

get-message-juvix = $(base-path)/$(get-message).juvix
get-message-nockma = $(anoma-build-dir)/$(get-message).nockma
get-message-proved = $(anoma-build-dir)/$(get-message).proved.nockma

unspent-resources = $(anoma-build-dir)/unspent-resources
last-message-txt = $(anoma-build-dir)/last-message.txt

port = $(anoma-build-dir)/port
host = $(anoma-build-dir)/host

$(anoma-build):
	mkdir -p $(anoma-build-dir)
	touch $(anoma-build)

.PHONY: clean
clean:
	juvix clean
	rm -rf $(anoma-build-dir)

.PHONY: anoma-start
anoma-start:
	rm -f $(config)
ifdef ANOMA_DEBUG
	cd $(ANOMA_PATH) && \
		mix phx.server --no-halt $(root)/../start-config.exs
else
	$(juvix-cmd) dev anoma start --force --anoma-dir $(ANOMA_PATH)
endif

.PHONY: anoma-stop
anoma-stop:
ifdef ANOMA_DEBUG
	@echo "ANOMA_DEBUG is incompatible with anoma-stop" && false
else
	$(juvix-cmd) dev anoma stop
endif

.PHONY: $(message-file)
$(message-file): $(anoma-build)
	@echo $(message) \
	> $(message-file)

$(config): $(anoma-build)
ifdef ANOMA_DEBUG
	cp $(ANOMA_PATH)/config.yaml $(config)
else
	$(juvix-cmd) dev anoma print-config > $(config)
endif

.PHONY: add-transaction
add-transaction: $(proved) $(config)
	$(juvix-cmd) dev anoma -c $(config) add-transaction $(proved)

.PHONY: get-last-message
get-last-message: $(last-message-txt)
	@cat $(last-message-txt)

.PHONY: $(last-message-txt)
$(last-message-txt): $(get-message-nockma) $(config) $(unspent-resources)
	tail -n 1 $(unspent-resources) > $(temp-file)
	$(juvix-cmd) dev anoma -c $(config) prove $(get-message-nockma) -o $(get-message-proved) --arg 'base64:$(temp-file)'
	$(juvix-cmd) dev nockma encode --cue --from bytes --to bytes < anoma-build/GetMessage.proved.nockma > $(last-message-txt)

$(nockma): $(juvix) $(anoma-build)
	$(juvix-cmd) compile anoma $(juvix) -o $(nockma)

$(proved): $(nockma) $(config)
	$(juvix-cmd) dev anoma -c $(config) prove $(nockma) -o $(proved)

$(get-message-nockma): $(anoma-build) $(get-message-juvix)
	$(juvix-cmd) compile anoma $(get-message-juvix) -o $(get-message-nockma)

.PHONY: $(unspent-resources)
$(unspent-resources): $(anoma-build) $(host) $(port)
	curl -X GET $$(cat $(host)):$$(cat $(port))/indexer/unspent-resources | jq -r '.unspent_resources[-1] // error("no messages exist")' > $(unspent-resources)

$(host): $(config)
	yq -r '.url' $(config) | tr -d '\n' > $(host)

$(port): $(config)
	yq -r '.port' $(config) | tr -d '\n' > $(port)
