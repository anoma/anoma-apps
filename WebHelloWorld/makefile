# dependencies:
# 	- jq
# 	- yq
# 	- curl

# How to run:
# 0. set ANOMA_PATH environment variable to the folder where anoma is cloned and compiled (branch origin/artem/juvix-node-integration-v0.28)
# 1. make anoma-start # start the Anoma node
# 3. make message="my message" add-transaction # Submit the WebHelloWorld transaction to anoma with a message
# 4. make get-last-message # Get the message from the latest WebHelloWorld Resource (my message)
# 5. make get-all-messages # Get all messages from Anoma
# ...
# 5. make anoma-stop # stop the Anoma node when you've finished
ANOMA_PATH ?= $(error set the ANOMA_PATH variable to a path to an anoma clone)

ifneq ($(XDG_CONFIG_HOME),)
    juvix-cmd = XDG_CONFIG_HOME=$(XDG_CONFIG_HOME) juvix
else
    juvix-cmd = juvix
endif

base-path = .
base = WebHelloWorld
get-message = GetMessage
kind = AppIdentity
logic = Logic
message ?= "hello world\n"

anoma-build-dir = anoma-build
anoma-build = $(anoma-build-dir)/.exists

config = $(anoma-build-dir)/config.yaml

temp-file := $(anoma-build-dir)/temp_line
message-file = $(anoma-build-dir)/message

kind-juvix = $(base-path)/$(kind).juvix
kind-nockma = $(anoma-build-dir)/$(kind).nockma
kind-proved = $(anoma-build-dir)/$(kind).proved.nockma
kind-proved-cued = $(anoma-build-dir)/$(kind).cued.nockma
kind-proved-cued-b64 = $(anoma-build-dir)/$(kind).cued.nockma.b64

juvix = $(base-path)/$(base).juvix
nockma = $(anoma-build-dir)/$(base).nockma
proved = $(anoma-build-dir)/$(base).proved.nockma

get-message-juvix = $(base-path)/$(get-message).juvix
get-message-nockma = $(anoma-build-dir)/$(get-message).nockma
get-message-proved = $(anoma-build-dir)/$(get-message).proved.nockma

logic-juvix = $(base-path)/$(logic).juvix
logic-nockma = $(anoma-build-dir)/$(logic).nockma
logic-proved = $(anoma-build-dir)/$(logic).proved.nockma

filter-request = $(anoma-build-dir)/filter-request.json

unspent-resources = $(anoma-build-dir)/unspent-resources
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
	rm -f $(config)
ifdef ANOMA_DEBUG
	cd $(ANOMA_PATH) && \
		mix phx.server --no-halt $(root)/../../start-config.exs
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
	@$(juvix-cmd) dev anoma print-config > $(config)

.PHONY: compile-add-message
compile-add-message: $(nockma)

.PHONY: compile-get-message
compile-get-message: $(get-message-nockma)

.PHONY: compile-logic
compile-logic: $(logic-proved)

.PHONY: compute-kind
compute-kind: $(kind-proved-cued)

.PHONY: add-transaction
add-transaction: $(proved) $(config)
	$(juvix-cmd) dev anoma -c $(config) add-transaction $(proved)

.PHONY: get-last-message
get-last-message: $(last-message-txt)
	@cat $(last-message-txt)

.PHONY: $(last-message-txt)
$(last-message-txt): $(get-message-nockma) $(config) $(unspent-resources)
	@tail -n 1 $(unspent-resources) > $(temp-file)
	@$(juvix-cmd) dev anoma -c $(config) prove $(get-message-nockma) -o $(get-message-proved) --arg 'base64:$(temp-file)'
	@$(juvix-cmd) dev nockma encode --cue --from bytes --to bytes < anoma-build/GetMessage.proved.nockma > $(last-message-txt)

.PHONY: get-all-messages
get-all-messages: $(get-message-nockma) $(config) $(unspent-resources)
	@while IFS= read -r line; do \
		echo "$$line" > $(temp-file); \
		$(juvix-cmd) dev anoma -c $(config) prove $(get-message-nockma) -o $(get-message-proved) --arg 'base64:$(temp-file)'; \
		$(juvix-cmd) dev nockma encode --cue --from bytes --to bytes < anoma-build/GetMessage.proved.nockma > $(last-message-txt); \
		cat $(last-message-txt); \
	done < $(unspent-resources)

$(nockma): $(juvix) $(anoma-build)
	$(juvix-cmd) compile anoma $(juvix) -o $(nockma)

$(proved): $(nockma) $(config) $(message-file) $(logic-proved)
	$(juvix-cmd) dev anoma -c $(config) prove $(nockma) -o $(proved) --arg 'bytes:$(logic-proved)' --arg 'bytes-unjammed:$(message-file)'

$(kind-nockma): $(kind-juvix) $(anoma-build)
	$(juvix-cmd) compile anoma $(kind-juvix) -o $(kind-nockma)

$(kind-proved): $(kind-nockma) $(config) $(logic-proved)
	$(juvix-cmd) dev anoma -c $(config) prove $(kind-nockma) -o $(kind-proved) --arg 'bytes:$(logic-proved)'

$(kind-proved-cued): $(kind-proved)
	$(juvix-cmd) dev nockma encode --cue --from bytes --to bytes < $(kind-proved) > $(kind-proved-cued)

$(kind-proved-cued-b64): $(kind-proved)
	$(juvix-cmd) dev nockma encode --cue --from bytes --to base64 < $(kind-proved) > $(kind-proved-cued-b64)

$(filter-request): $(kind-proved-cued-b64)
	jq -n --arg KIND $$(cat $(kind-proved-cued-b64)) \
	'{filters: [{kind: $$KIND}]}' \
	> $(filter-request)

$(get-message-nockma): $(anoma-build) $(get-message-juvix)
	$(juvix-cmd) compile anoma $(get-message-juvix) -o $(get-message-nockma)

$(logic-nockma): $(anoma-build) $(logic-juvix)
	$(juvix-cmd) compile anoma $(logic-juvix) -o $(logic-nockma)

$(logic-proved): $(logic-nockma) $(config)
	$(juvix-cmd) dev anoma -c $(config) prove $(logic-nockma) -o $(logic-proved)

.PHONY: $(unspent-resources)
$(unspent-resources): $(anoma-build) $(host) $(port) $(filter-request)
	curl -X POST \
	$$(cat $(host)):$$(cat $(port))/indexer/filter-resources \
	-H "accept: application/json" \
	-H "Content-Type: application/json" \
	-d @- \
	< $(filter-request) \
	| jq -r 'if has("resources") then .resources[] else empty end' \
	> $(unspent-resources)

$(host): $(config)
	@yq -r '.url' $(config) | tr -d '\n' > $(host)

$(port): $(config)
	@yq -r '.port' $(config) | tr -d '\n' > $(port)
