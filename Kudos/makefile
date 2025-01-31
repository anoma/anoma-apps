
ANOMA_PATH ?= $(error set the ANOMA_PATH variable to a path to an anoma clone)
ANOMA_DEBUG ?=

base-path = Kudos
logic = Logic
create = Create

anoma-build-dir = anoma-build
anoma-build = $(anoma-build-dir)/.exists

config = $(anoma-build-dir)/config.yaml
anoma-config = $(ANOMA_PATH)/config.yaml

random-32bytes = $(anoma-build-dir)/random-32bytes

logic-juvix = $(base-path)/$(logic).juvix
logic-nockma = $(anoma-build-dir)/$(logic).nockma
logic-proved = $(anoma-build-dir)/$(logic).proved.nockma

create-juvix = $(base-path)/$(create).juvix
create-nockma = $(anoma-build-dir)/$(create).nockma
create-proved = $(anoma-build-dir)/$(create).proved.nockma

unspent-resources = $(anoma-build-dir)/unspent-resources

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

.PHONY: anoma-stop
anoma-stop:
ifdef ANOMA_DEBUG
	@echo "ANOMA_DEBUG is incompatible with anoma-stop" && false
else
	juvix dev anoma stop
endif

.PHONY: anoma-start
anoma-start:
	rm -f $(config)
ifdef ANOMA_DEBUG
	cd $(ANOMA_PATH) && \
		mix run --no-halt $(root)/../../start-config.exs
else
	juvix dev anoma start --anoma-dir $(ANOMA_PATH)
endif

.PHONY: kudos-initialize
kudos-initialize: $(create-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(create-proved)

.PHONY: get-unspent-resources
get-unspent-resources: $(unspent-resources)
	@cat $(unspent-resources)

.PHONY: did-it-work
did-it-work:
	rm -f $(config)
	juvix dev anoma start --anoma-dir $(ANOMA_PATH) -f
	make kudos-initialize
	watch -n 0.5 make get-unspent-resources

.PHONY: $(unspent-resources)
$(unspent-resources): $(anoma-build) $(host) $(port)
	grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.IndexerService.ListUnspentResources | jq -r 'try .unspentResources[]' > $(unspent-resources)

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
	dd bs=1 count=32 < /dev/urandom \
	| python3 -c "import sys; print(int.from_bytes(sys.stdin.buffer.read(), 'little'), end='')" \
	| juvix dev nockma encode --from text --to bytes \
	> $(random-32bytes)

$(logic-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma -O0 $(logic-juvix) -o $(logic-nockma)

$(logic-proved): $(logic-nockma) $(config)
	juvix dev anoma -c $(config) prove $(logic-nockma) -o $(logic-proved)

$(create-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma -O0 $(create-juvix) -o $(create-nockma)

$(create-proved): $(create-nockma) $(config) $(random-32bytes) $(logic-proved)
	juvix dev anoma -c $(config) prove $(create-nockma) \
	-o $(create-proved) \
	--arg 'bytes:$(random-32bytes)' \
	--arg 'bytes:$(logic-proved)' \
	--arg 'nat:10'
