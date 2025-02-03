ANOMA_PATH ?= $(error set the ANOMA_PATH variable to a path to an anoma clone)
ANOMA_DEBUG ?=
owner-id ?= 0

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

owner-request = $(anoma-build-dir)/owner-request-$(owner-id).json
owner-id-file = $(anoma-build-dir)/owner-id-$(owner-id)
owner-balance = $(anoma-build-dir)/owner-balance-$(owner-id)
owner-secret-der = $(anoma-build-dir)/owner-secret-der-$(owner-id)
owner-public-der = $(anoma-build-dir)/owner-public-der-$(owner-id)
owner-secret-key = $(anoma-build-dir)/owner-secret-key-$(owner-id)
owner-public-key = $(anoma-build-dir)/owner-public-key-$(owner-id)
owner-public-key-base64 = $(owner-public-key).base64
owner-signing-key = $(anoma-build-dir)/owner-signing-key-$(owner-id)

# hack to make the makefile check if this is set
$(ANOMA_PATH):

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
	juvix dev anoma start --force --anoma-dir $(ANOMA_PATH)
endif

.PHONY: get-balance
get-balance: $(owner-balance)
	@cat $(owner-balance)

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
	grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.IndexerService.ListUnspentResources \
	| jq -r 'try .unspentResources[]' > $(unspent-resources) \

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
	> $(random-32bytes) \

$(logic-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(logic-juvix) -o $(logic-nockma)

$(logic-proved): $(logic-nockma) $(config)
	juvix dev anoma -c $(config) prove $(logic-nockma) -o $(logic-proved)

$(create-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(create-juvix) -o $(create-nockma)

$(owner-public-key-base64): $(owner-public-key)
	base64 < $(owner-public-key) | tr -d "\n\r" > $(owner-public-key-base64)

$(owner-request): $(anoma-build) $(owner-public-key) $(owner-public-key-base64)
	jq -n --arg OWNER $$(cat $(owner-public-key-base64)) \
	'{node_info: {node_id: ""}, filters: [{owner: $$OWNER}]}' \
	> $(owner-request) \

$(owner-id-file):
	echo -n $(owner-id) > $(owner-id-file)

.PHONY: $(owner-balance)
$(owner-balance): $(anoma-build) $(host) $(port) $(owner-request)
	grpcurl -plaintext \
	-d @ \
	$$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.BlockService.Filter \
	< $(owner-request) \
	| jq -r 'try .resources[]' \
	> $(owner-balance) \

$(create-proved): $(create-nockma) $(config) $(random-32bytes) $(logic-proved) $(owner-signing-key) $(owner-public-key) $(owner-id-file)
	juvix dev anoma -c $(config) prove $(create-nockma) \
	-o $(create-proved) \
	--arg 'bytes-unjammed:$(owner-signing-key)' \
	--arg 'bytes-unjammed:$(owner-public-key)' \
	--arg 'bytes-unjammed:$(random-32bytes)' \
	--arg 'bytes:$(logic-proved)' \
	--arg 'nat:10' \
	--arg 'bytes-unjammed:$(owner-id-file)' \

$(owner-secret-der): $(anoma-build)
	openssl genpkey -algorithm ed25519 -outform DER \
	> $(owner-secret-der) \

$(owner-secret-key): $(owner-secret-der)
	tail -c 32 < $(owner-secret-der) > $(owner-secret-key)

$(owner-public-der): $(owner-secret-der)
	openssl pkey -in $(owner-secret-der) \
	-pubout -outform DER \
	> $(owner-public-der) \

$(owner-public-key): $(owner-public-der)
	tail -c 32 < $(owner-public-der) > $(owner-public-key)

$(owner-signing-key): $(owner-public-key) $(owner-secret-key)
	cat $(owner-secret-key) $(owner-public-key) \
	> $(owner-signing-key) \
