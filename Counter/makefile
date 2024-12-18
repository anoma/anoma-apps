# how to run:
# 0. set anoma-path variable in this file to the folder where anoma is cloned and compiled (branch origin/artem/juvix-node-integration-v0.28)
# 1. make run-client
# 2. make run-node # keep this running in a separate terminal
# 3. make add-transaction
anoma-path = ~/Projects/Anoma/anoma
base-path = Simple/Interface/Transaction

initialize = Initialize
increment = Increment

juvix1 = $(base-path)/$(initialize).juvix
nockma1 = $(initialize).nockma
proved1 = $(initialize).proved.nockma

juvix2 = $(base-path)/$(increment).juvix
nockma2 = $(increment).nockma
proved2 = $(increment).proved.nockma

counter-logic-juvix = $(base-path)/$(counter-logic).juvix
counter-logic-nockma = $(counter-logic).nockma
counter-logic-proved = $(counter-logic).proved.nockma

root = $(shell pwd)
config = config.yaml
anoma-config = $(anoma-path)/$(config)

all: $(proved)

.PHONY: clean
clean:
	rm -rf $(config) $(proved1) $(nockma1) $(proved2) $(nockma2)

.PHONY: run-client
run-client:
	juvix dev anoma start --anoma-dir $(anoma-path)

.PHONY: run-node
run-node:
	cd $(anoma-path) && \
		mix run --no-halt $(root)/../start-config.exs

.PHONY: initialize-counter
initialize-counter: $(proved1) $(config)
	juvix dev anoma -c $(config) add-transaction $(proved1)

.PHONY: increment-counter
increment-counter: $(proved2) $(config)
	juvix dev anoma -c $(config) add-transaction $(proved2)

# TODO Improve script or use JS/TS helpers.

$(config): $(anoma-config)
	cp $(anoma-config) $(config)

$(nockma1): $(juvix1)
	juvix compile anoma $(juvix1)

$(nockma2): $(juvix2)
	juvix compile anoma $(juvix2)

$(proved1): $(nockma1) $(config)
	juvix dev anoma -c $(config) prove $(nockma1)

$(proved2): $(nockma2) $(config)
	juvix dev anoma -c $(config) prove $(nockma2)

$(counter-logic-nockma): $(counter-logic-juvix)
	@juvix compile anoma $(counter-logic-juvix)

$(counter-logic-proved): $(counter-logic-nockma)
	@juvix dev anoma prove $(counter-logic-nockma)
