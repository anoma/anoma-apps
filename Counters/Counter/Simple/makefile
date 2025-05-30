# dependencies:
# 	- jq
# 	- yq
# 	- curl
# how to run:
# - set ANOMA_PATH environment variable to the folder where anoma is cloned and compiled (branch origin/artem/juvix-node-integration-v0.28)
# - make anoma-start
# - make counter-initialize
# - make counter-get
# - make counter-increment
# - make counter-get
# Note that one needs to wait for at least 2 seconds between each make counter-{initialize|increment} invocation so that a block is created in the node.
ANOMA_PATH ?= $(error set the ANOMA_PATH variable to a path to an anoma clone)
ANOMA_DEBUG ?=

ifneq ($(XDG_CONFIG_HOME),)
    juvix-cmd = XDG_CONFIG_HOME=$(XDG_CONFIG_HOME) juvix
else
    juvix-cmd = juvix
endif

base-path = .

initialize = Initialize
increment = Increment
get-count = GetCount
counter-logic = Logic

anoma-build = anoma-build

initialize-juvix = $(base-path)/$(initialize).juvix
initialize-nockma = $(anoma-build)/$(initialize).nockma
initialize-proved = $(anoma-build)/$(initialize).proved.nockma

increment-juvix = $(base-path)/$(increment).juvix
increment-nockma = $(anoma-build)/$(increment).nockma
increment-proved = $(anoma-build)/$(increment).proved.nockma

counter-logic-juvix = $(base-path)/$(counter-logic).juvix
counter-logic-nockma = $(anoma-build)/$(counter-logic).nockma
counter-logic-proved = $(anoma-build)/$(counter-logic).proved.nockma

get-count-juvix = $(base-path)/$(get-count).juvix
get-count-nockma = $(anoma-build)/$(get-count).nockma
get-count-proved = $(anoma-build)/$(get-count).proved.nockma
get-count-result = $(anoma-build)/$(get-count).result

unspent-resources = $(anoma-build)/unspent-resources
get-latest-root = $(anoma-build)/latest-root

root = $(shell pwd)
config = $(anoma-build)/config.yaml

port = $(anoma-build)/port
host = $(anoma-build)/host

all-juvix = $(shell find . -name '*.juvix')

.PHONY: clean
clean:
	juvix clean
	rm -rf $(anoma-build)

.PHONY: anoma-stop
anoma-stop:
ifdef ANOMA_DEBUG
	@echo "ANOMA_DEBUG is incompatible with anoma-stop" && false
else
	$(juvix-cmd) dev anoma stop
endif

.PHONY: anoma-start
anoma-start:
	rm -f $(config)
ifdef ANOMA_DEBUG
	cd $(ANOMA_PATH) && \
		mix phx.server --no-halt $(root)/../../../start-config.exs
else
	$(juvix-cmd) dev anoma start --force --anoma-dir $(ANOMA_PATH)
endif

.PHONY: get-latest-root
get-latest-root: $(get-latest-root)
	@cat $(get-latest-root)

.PHONY: get-unspent-resources
get-unspent-resources: $(unspent-resources)
	@cat $(unspent-resources)

.PHONY: counter-initialize
counter-initialize: $(initialize-proved) $(config)
	$(juvix-cmd) dev anoma -c $(config) add-transaction $(initialize-proved)

.PHONY: counter-increment
counter-increment: $(increment-proved) $(config)
	$(juvix-cmd) dev anoma -c $(config) add-transaction $(increment-proved)

.PHONY: counter-get
counter-get: $(get-count-result)
	@cat $(get-count-result)
	@echo ""

.PHONY: cat-config
cat-config: $(config)
	@cat $(config)

$(host): $(config)
	@yq -r '.url' $(config) | tr -d '\n' > $(host)

$(port): $(config)
	@yq -r '.port' $(config) | tr -d '\n' > $(port)

.PHONY: $(unspent-resources)
$(unspent-resources): $(anoma-build) $(host) $(port)
	curl -X GET $$(cat $(host)):$$(cat $(port))/indexer/unspent-resources | jq -r 'try .unspent_resources[]' > $(unspent-resources)

.PHONY: $(get-latest-root)
$(get-latest-root): $(anoma-build) $(host) $(port)
	curl -X GET $$(cat $(host)):$$(cat $(port))/indexer/root \
	| jq -r '.root' \
	> $(get-latest-root)

$(anoma-build):
	@mkdir -p $(anoma-build)

$(config): $(anoma-build)
ifdef ANOMA_DEBUG
	cp $(ANOMA_PATH)/config.yaml $(config)
else
	$(juvix-cmd) dev anoma print-config > $(config)
endif

$(initialize-nockma): $(anoma-build) $(all-juvix)
	$(juvix-cmd) compile anoma $(initialize-juvix) -o $(initialize-nockma)

$(initialize-proved): $(counter-logic-proved) $(initialize-nockma) $(config)
	$(juvix-cmd) dev anoma -c $(config) prove $(initialize-nockma) -o $(initialize-proved) --arg "bytes:$(counter-logic-proved)"

$(increment-nockma): $(anoma-build) $(all-juvix)
	$(juvix-cmd) compile anoma $(increment-juvix) -o $(increment-nockma)

$(increment-proved): $(increment-nockma) $(unspent-resources) $(get-latest-root) $(config) $(counter-logic-proved)
	$(juvix-cmd) dev anoma -c $(config) prove $(increment-nockma) \
	-o $(increment-proved) \
	--arg "bytes:$(counter-logic-proved)" \
	--arg "base64:$(unspent-resources)" \
	--arg "base64-unjammed:$(get-latest-root)"

$(get-count-nockma): $(anoma-build) $(all-juvix)
	$(juvix-cmd) compile anoma $(get-count-juvix) -o $(get-count-nockma)

$(get-count-proved): $(unspent-resources) $(get-count-nockma) $(config)
	$(juvix-cmd) dev anoma -c $(config) prove $(get-count-nockma) -o $(get-count-proved) --arg "base64:$(unspent-resources)"

$(get-count-result): $(get-count-proved)
	$(juvix-cmd) dev nockma encode --from bytes --to text < $(get-count-proved) > $(get-count-result)

$(counter-logic-nockma): $(anoma-build) $(all-juvix)
	$(juvix-cmd) compile anoma $(counter-logic-juvix) -o $(counter-logic-nockma)

$(counter-logic-proved): $(counter-logic-nockma) $(config)
	$(juvix-cmd) dev anoma -c $(config) prove $(counter-logic-nockma) -o $(counter-logic-proved)
