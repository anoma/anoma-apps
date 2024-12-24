# how to run:
# 1. set ANOMA_PATH environment variable to the folder where anoma is cloned and compiled (branch origin/artem/juvix-node-integration-v0.28)
# 2. make run-node # keep this running in a separate terminal
# 3. make create-consumable-resource # this creates a new counter identity. Set the counter_id to setup a new counter identity.
ANOMA_PATH ?= $(error set the ANOMA_PATH variable to a path to an anoma clone)

# Change this to create a new counter identity
counter_id ?= 0

consumable = Consumable
consumable-transaction = ConsumableTransaction
base-path = .

anoma-build = anoma-build
root = $(shell pwd)

config = $(anoma-build)/config.yaml
anoma-config = $(ANOMA_PATH)/config.yaml

random-32bytes = $(anoma-build)/random-32bytes-$(counter_id)

consumable-juvix = $(base-path)/$(consumable).juvix
consumable-nockma = $(anoma-build)/$(consumable).nockma
consumable-proved = $(anoma-build)/$(consumable)-$(counter_id).proved.nockma

consumable-transaction-juvix = $(base-path)/$(consumable-transaction).juvix
consumable-transaction-nockma = $(anoma-build)/$(consumable-transaction).nockma
consumable-transaction-proved = $(anoma-build)/$(consumable-transaction).proved.nockma

all-juvix = $(shell find . -name '*.juvix')

.PHONY: clean
clean:
	juvix clean
	rm -rf $(anoma-build)

.PHONY: create-consumable-resource
create-consumable-resource: $(config) $(consumable-transaction-proved)
	juvix dev anoma -c $(config) add-transaction $(consumable-transaction-proved)

.PHONY: run-node
run-node:
	cd $(ANOMA_PATH) && \
		mix run --no-halt $(root)/../../start-config.exs

$(anoma-build):
	@mkdir -p $(anoma-build)

$(config): $(anoma-build) $(anoma-config)
	@cp $(anoma-config) $(config)

$(random-32bytes): $(anoma-build)
	dd bs=1 count=32 < /dev/urandom > $(random-32bytes)

$(consumable-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(consumable-juvix) -o $(consumable-nockma)

$(consumable-proved): $(config) $(random-32bytes) $(consumable-nockma)
	juvix dev anoma -c $(config) prove $(consumable-nockma) -o $(consumable-proved) --arg "bytes:$(random-32bytes)"

$(consumable-transaction-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(consumable-transaction-juvix) -o $(consumable-transaction-nockma)

$(consumable-transaction-proved): $(config) $(consumable-transaction-nockma) $(consumable-proved)
	juvix dev anoma -c $(config) prove $(consumable-transaction-nockma) -o $(consumable-transaction-proved) --arg "bytes:$(consumable-proved)"
