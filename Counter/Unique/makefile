# how to run:
# 1. set ANOMA_PATH environment variable to the folder where anoma is cloned and compiled (branch origin/artem/juvix-node-integration-v0.28)
# 2. make run-node # keep this running in a separate terminal
# 3. make create-consumable-resource # this creates a new counter identity. Set the counter_id to setup a new counter identity.
ANOMA_PATH ?= $(error set the ANOMA_PATH variable to a path to an anoma clone)
ANOMA_DEBUG ?=

# Change this to create a new counter identity
counter_id ?= 0

consumable = Consumable
consumable-transaction = ConsumableTransaction
logic = Logic
initialize = Initialize

base-path = .

anoma-build-dir = anoma-build
anoma-build = $(anoma-build-dir)/.exists
root = $(shell pwd)

config = $(anoma-build-dir)/config.yaml
anoma-config = $(ANOMA_PATH)/config.yaml

random-32bytes = $(anoma-build-dir)/random-32bytes-$(counter_id)
random-32bytes-initialize = $(anoma-build-dir)/random-32bytes-initialize-$(counter_id)

consumable-juvix = $(base-path)/$(consumable).juvix
consumable-nockma = $(anoma-build-dir)/$(consumable).nockma
consumable-proved = $(anoma-build-dir)/$(consumable)-$(counter_id).proved.nockma

consumable-transaction-juvix = $(base-path)/$(consumable-transaction).juvix
consumable-transaction-nockma = $(anoma-build-dir)/$(consumable-transaction).nockma
consumable-transaction-proved = $(anoma-build-dir)/$(consumable-transaction).proved.nockma

logic-juvix = $(base-path)/$(logic).juvix
logic-nockma = $(anoma-build-dir)/$(logic).nockma
logic-proved = $(anoma-build-dir)/$(logic).proved.nockma

initialize-juvix = $(base-path)/$(initialize).juvix
initialize-nockma = $(anoma-build-dir)/$(initialize).nockma
initialize-proved = $(anoma-build-dir)/$(initialize).proved.nockma

get-latest-root = $(anoma-build-dir)/latest-root

port = $(anoma-build-dir)/port
host = $(anoma-build-dir)/host

all-juvix = $(shell find . -name '*.juvix')

$(anoma-build):
	@mkdir -p $(anoma-build-dir)
	@touch $(anoma-build)

.PHONY: clean
clean:
	juvix clean
	rm -rf $(anoma-build-dir)

.PHONY: create-consumable-resource
create-consumable-resource: $(config) $(consumable-transaction-proved)
	juvix dev anoma -c $(config) add-transaction $(consumable-transaction-proved)

.PHONY: counter-initialize
counter-initialize: $(initialize-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(initialize-proved)

.PHONY: node-start
node-start:
ifdef ANOMA_DEBUG
	cd $(ANOMA_PATH) && \
		mix run --no-halt $(root)/../../start-config.exs
else
	juvix dev anoma start --anoma-dir $(ANOMA_PATH)
endif

$(config): $(anoma-build)
ifdef ANOMA_DEBUG
	cp $(anoma-config) $(config)
else
	juvix dev anoma print-config > $(config)
endif

$(host): $(config)
	@yq -r '.url' $(config) | tr -d '\n' > $(host)

$(port): $(config)
	@yq -r '.port' $(config) | tr -d '\n' > $(port)

$(random-32bytes): $(anoma-build)
	dd bs=1 count=32 < /dev/urandom > $(random-32bytes)

$(random-32bytes-initialize): $(anoma-build)
	dd bs=1 count=32 < /dev/urandom > $(random-32bytes-initialize)

$(consumable-nockma): $(anoma-build) $(consumable-juvix)
	juvix compile anoma $(consumable-juvix) -o $(consumable-nockma)

$(consumable-proved): $(config) $(random-32bytes) $(consumable-nockma)
	juvix dev anoma -c $(config) prove $(consumable-nockma) -o $(consumable-proved) --arg "bytes:$(random-32bytes)"

$(consumable-transaction-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(consumable-transaction-juvix) -o $(consumable-transaction-nockma)

$(consumable-transaction-proved): $(config) $(consumable-transaction-nockma) $(consumable-proved)
	juvix dev anoma -c $(config) prove $(consumable-transaction-nockma) -o $(consumable-transaction-proved) \
	--arg "bytes:$(consumable-proved)"

$(logic-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(logic-juvix) -o $(logic-nockma)

$(logic-proved): $(logic-nockma) $(config)
	juvix dev anoma -c $(config) prove $(logic-nockma) -o $(logic-proved)

$(initialize-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(initialize-juvix) -o $(initialize-nockma)

.PHONY: $(get-latest-root) $(host) $(port)
$(get-latest-root): $(anoma-build) $(host) $(port)
	@grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.BlockService.Root | jq -r '.root' > $(get-latest-root)

$(initialize-proved): $(initialize-nockma) $(logic-proved) $(random-32bytes-initialize) $(consumable-proved) $(get-latest-root) $(config)
	juvix dev anoma -c $(config) prove $(initialize-nockma) -o $(initialize-proved) \
	--arg "bytes:$(random-32bytes-initialize)" \
	--arg "bytes:$(consumable-proved)" \
    --arg "bytes:$(logic-proved)" \
	--arg "base64:$(get-latest-root)"
