# how to run:
# 0. set anoma-path variable in this file to the folder where anoma is cloned and compiled
# 1. make run-client
# 2. make run-node # keep this running in a separate terminal
# 3. make add-transaction
anoma-path = ~/projects/anoma
base = Main

juvix = $(base).juvix
nockma = $(base).nockma
proved = $(base).proved.nockma
root = $(shell pwd)
config = config.yaml
anoma-config = $(anoma-path)/$(config)

all: $(proved)

.PHONY: run-client
run-client:
	juvix dev anoma start --anoma-dir $(anoma-path)

.PHONY: run-node
run-node:
	cd $(anoma-path) && \
		mix run --no-halt $(root)/start-config.exs

.PHONY: add-transaction
add-transaction: $(proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(proved)

$(config): $(anoma-config)
	cp $(anoma-config) $(config)

$(nockma): $(juvix)
	juvix compile anoma $(juvix)

$(proved): $(nockma) $(config)
	juvix dev anoma -c $(config) prove $(nockma)
