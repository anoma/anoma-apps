ANOMA_PATH ?= $(error set the ANOMA_PATH variable to a path to an anoma clone)
ANOMA_DEBUG ?=
owner-id ?= 0
receiver-id ?= 0
quantity ?= $(error set the quantity variable to a number)
root = $(shell pwd)

split-receiver-id-1 ?= 0
split-receiver-id-2 ?= 0
split-spec ?= Kudos/split.yaml

split-reciever-quantity-1 ?= 0
split-receiver-quantity-2 ?= 0

base-path = Kudos
logic = Logic
create = Create
transfer = Transfer
make-part = MakePart
split = Split
kudos-kind = KudosKind

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

transfer-juvix = $(base-path)/$(transfer).juvix
transfer-nockma = $(anoma-build-dir)/$(transfer).nockma
transfer-proved = $(anoma-build-dir)/$(transfer).proved.nockma

make-part-juvix = $(base-path)/$(make-part).juvix
make-part-nockma = $(anoma-build-dir)/$(make-part).nockma
make-part-proved = $(anoma-build-dir)/$(make-part).proved.nockma

kudos-kind-juvix = $(base-path)/$(kudos-kind).juvix
kudos-kind-nockma = $(anoma-build-dir)/$(kudos-kind).nockma

split-juvix = $(base-path)/$(split).juvix
split-nockma = $(anoma-build-dir)/$(split).nockma

resource-to-split = $(anoma-build-dir)/resource-to-split

unspent-resources = $(anoma-build-dir)/unspent-resources

get-latest-root = $(anoma-build-dir)/latest-root
port = $(anoma-build-dir)/port
host = $(anoma-build-dir)/host

all-juvix = $(shell find . -name '*.juvix')

owner-request = $(anoma-build-dir)/owner-request.json
owner-id-file = $(anoma-build-dir)/owner-id
owner-balance = $(anoma-build-dir)/owner-balance
owner-first-resource = $(anoma-build-dir)/owner-balance-first

person-secret-der = $(anoma-build-dir)/person-secret-der
person-secret-key = $(anoma-build-dir)/person-secret-key
person-public-key = $(anoma-build-dir)/person-public-key
person-public-der = $(anoma-build-dir)/person-public-der
person-signing-key = $(anoma-build-dir)/person-signing-key

owner-secret-der = $(anoma-build-dir)/owner-secret-der
owner-public-der = $(anoma-build-dir)/owner-public-der
owner-secret-key = $(anoma-build-dir)/owner-secret-key
owner-public-key = $(anoma-build-dir)/owner-public-key
owner-public-key-base64 = $(owner-public-key).base64
owner-signing-key = $(anoma-build-dir)/owner-signing-key

receiver-secret-der = $(anoma-build-dir)/receiver-secret-der
receiver-public-der = $(anoma-build-dir)/receiver-public-der
receiver-public-key = $(anoma-build-dir)/receiver-public-key

split-quantity = $(anoma-build-dir)/split-quantity
partition = $(anoma-build-dir)/partition
make-named-part-bytes = $(anoma-build-dir)/make-named-part-bytes
make-named-part-base64 = $(anoma-build-dir)/make-named-part-base64
split-proved = $(anoma-build-dir)/split-proved
owner-to-split-signing-key = $(anoma-build-dir)/owner-to-split-signing-key
owner-to-split-public-key = $(anoma-build-dir)/owner-to-split-public-key
owner-to-split-public-key-base64 = $(anoma-build-dir)/owner-to-split-public-key-base64
owner-to-split-kudos-kind-proved = $(anoma-build-dir)/owner-to-split-kudos-kind-proved
owner-to-split-kudos-kind-proved-cued-base64 = $(anoma-build-dir)/owner-to-split-kudos-kind-proved-cued-base64
owner-to-split-kudos-symbol = $(anoma-build-dir)/owner-to-split-kudos-symbol
owner-to-split-resource-request = $(anoma-build-dir)/owner-to-split-resource-request
owner-to-split-resource = $(anoma-build-dir)/owner-to-split-resource

# hack to make the makefile check if this is set
$(ANOMA_PATH):

$(anoma-build):
	mkdir -p $(anoma-build-dir)
	touch $(anoma-build)

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
		mix run --no-halt $(root)/../start-config.exs
else
	juvix dev anoma start --force --anoma-dir $(ANOMA_PATH)
endif

.PHONY: get-balance
get-balance: $(owner-balance)
	@cat $(owner-balance)

.PHONY: kudos-initialize
kudos-initialize: $(create-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(create-proved)

.PHONY: kudos-transfer
kudos-transfer: $(transfer-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(transfer-proved)

.PHONY: kudos-split
kudos-split: $(split-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(split-proved)

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

.PHONY: $(random-32bytes)
$(random-32bytes): $(anoma-build)
	dd bs=1 count=32 < /dev/urandom \
	> $(random-32bytes) \

.PHONY: $(get-latest-root)
$(get-latest-root): $(anoma-build) $(host) $(port)
	@grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.BlockService.Root \
	| jq -r '.root' \
	> $(get-latest-root)

$(logic-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(logic-juvix) -o $(logic-nockma)

$(logic-proved): $(logic-nockma) $(config)
	juvix dev anoma -c $(config) prove $(logic-nockma) -o $(logic-proved)

$(create-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(create-juvix) -o $(create-nockma)

$(transfer-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(transfer-juvix) -o $(transfer-nockma)

$(owner-public-key-base64): $(owner-public-key)
	base64 < $(owner-public-key) | tr -d "\n\r" > $(owner-public-key-base64)

$(owner-request): $(anoma-build) $(owner-public-key) $(owner-public-key-base64)
	jq -n --arg OWNER $$(cat $(owner-public-key-base64)) \
	'{node_info: {node_id: ""}, filters: [{owner: $$OWNER}]}' \
	> $(owner-request) \

.PHONY: $(owner-id-file)
$(owner-id-file):
	echo $(owner-id) | tr -d '\n' > $(owner-id-file)

.PHONY: $(owner-first-resource)
$(owner-first-resource): $(owner-balance)
	test -s $(owner-balance)
	head -n1 $(owner-balance) > $(owner-first-resource)

get-first-resource: $(owner-first-resource)
	@cat $(owner-first-resource)

.PHONY: $(owner-balance)
$(owner-balance): $(anoma-build) $(host) $(port) $(owner-request)
	grpcurl -plaintext \
	-d @ \
	$$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.BlockService.Filter \
	< $(owner-request) \
	| jq -r 'try .resources[]' \
	> $@

$(create-proved): $(create-nockma) $(config) $(random-32bytes) $(logic-proved) $(owner-signing-key) $(owner-public-key) $(owner-id-file)
	juvix dev anoma -c $(config) prove $(create-nockma) \
	-o $(create-proved) \
	--arg 'bytearray:$(owner-signing-key)' \
	--arg 'bytearray:$(owner-public-key)' \
	--arg 'bytes-unjammed:$(random-32bytes)' \
	--arg 'bytes:$(logic-proved)' \
	--arg 'nat:$(quantity)' \
	--arg 'bytes-unjammed:$(owner-id-file)' \

$(transfer-proved): $(transfer-nockma) $(config) $(random-32bytes) $(logic-proved) $(receiver-public-key) $(owner-first-resource) $(get-latest-root)
	juvix dev anoma -c $(config) prove $(transfer-nockma) \
	-o $(transfer-proved) \
	--arg 'base64-unjammed:$(get-latest-root)' \
	--arg 'bytes-unjammed:$(random-32bytes)' \
    --arg 'bytearray:$(owner-signing-key)' \
    --arg 'bytearray:$(owner-public-key)' \
	--arg 'bytearray:$(receiver-public-key)' \
    --arg 'base64:$(owner-first-resource)' \
	--arg 'bytes:$(logic-proved)' \

$(person-public-key)-%: $(person-public-der)-%
	tail -c 32 < $< > $@

.PRECIOUS: $(person-secret-der)-%
$(person-secret-der)-%: $(anoma-build)
	openssl genpkey -algorithm ed25519 -outform DER \
	> $@ \

$(person-secret-key)-%: $(person-secret-der)-%
	tail -c 32 < $< > $@

$(person-public-der)-%: $(person-secret-der)-%
	openssl pkey -in $< \
	-pubout -outform DER \
	> $@ \

$(person-signing-key)-%: $(person-public-key)-% $(person-secret-key)-%
	cat $(person-secret-key)-$* $(person-public-key)-$* \
	> $@ \

.PHONY: $(owner-secret-key)
$(owner-secret-key): $(person-secret-key)-$(owner-id)
	cp $< $@

.PHONY: $(owner-public-key)
$(owner-public-key): $(person-public-key)-$(owner-id)
	cp $< $@

$(owner-signing-key): $(person-signing-key)-$(owner-id)
	cp $< $@

.PHONY: $(receiver-public-key)
$(receiver-public-key): $(person-public-key)-$(receiver-id)
	cp $< $@

$(split-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(split-juvix) -o $(split-nockma)

$(make-part-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(make-part-juvix) -o $(make-part-nockma)

$(owner-to-split-signing-key): $(addprefix $(person-signing-key)-, $(shell yq '.owner' < $(split-spec) | tr -d '\n'))
	cp $< $@

$(owner-to-split-public-key): $(addprefix $(person-public-key)-, $(shell yq '.owner' < $(split-spec) | tr -d '\n'))
	cp $< $@

$(owner-to-split-public-key-base64): $(owner-to-split-public-key)
	base64 < $< | tr -d "\n\r" > $@

$(kudos-kind-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(kudos-kind-juvix) -o $(kudos-kind-nockma)

$(owner-to-split-kudos-symbol): $(split-spec)
	yq '.owner' < $(split-spec) | tr -d '\n' > $@

$(owner-to-split-kudos-kind-proved): $(kudos-kind-nockma) $(config) $(logic-proved) $(owner-to-split-public-key) $(owner-to-split-kudos-symbol)
	juvix dev anoma -c $(config) prove $(kudos-kind-nockma) \
	--arg 'bytes:$(logic-proved)' \
	--arg 'bytearray:$(owner-to-split-public-key)' \
	--arg 'bytes-unjammed:$(owner-to-split-kudos-symbol)' \
	-o $@

$(owner-to-split-kudos-kind-proved-cued-base64): $(owner-to-split-kudos-kind-proved)
	juvix dev nockma encode --cue --from bytes --to base64 < $< > $@

$(owner-to-split-resource-request): $(owner-to-split-public-key-base64) $(owner-to-split-kudos-kind-proved-cued-base64)
	jq -n \
	--arg OWNER $$(cat $(owner-to-split-public-key-base64)) \
	--arg KIND $$(cat $(owner-to-split-kudos-kind-proved-cued-base64)) \
	'{node_info: {node_id: ""}, filters: [{owner: $$OWNER}, {kind: $$KIND}]}' \
	> $@ \

$(owner-to-split-resource): $(host) $(port) $(owner-to-split-resource-request)
	grpcurl -plaintext \
	-d @ \
	$$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.BlockService.Filter \
	< $(owner-to-split-resource-request) \
	| jq -r 'try .resources[]' \
	> $@

$(split-quantity)-%: $(anoma-build) $(split-spec)
	yq -r '.partition.$*' < $(split-spec) > $@

$(make-named-part-bytes)-%: $(config) $(make-part-nockma) $(person-public-key)-% $(split-quantity)-%
	juvix dev anoma -c $(config) prove $(make-part-nockma) \
	--arg 'bytearray:$(person-public-key)-$*' \
	--arg "nat:$$(cat $(split-quantity)-$*)" \
	-o $@ \

$(make-named-part-base64)-%: $(make-named-part-bytes)-%
	juvix dev nockma encode --from bytes --to base64 < $< > $@

$(partition): $(addprefix $(make-named-part-base64)-, $(shell yq '.partition | keys[]' < $(split-spec)))
	paste -d '\n' $^ > $(partition)

$(split-proved): $(split-nockma) $(random-32bytes) $(partition) $(get-latest-root) $(logic-proved) $(split-nockma) $(owner-to-split-signing-key) $(owner-to-split-public-key) $(owner-to-split-resource)
	juvix dev anoma -c $(config) prove $(split-nockma) \
	--arg 'base64-unjammed:$(get-latest-root)' \
	--arg 'bytes-unjammed:$(random-32bytes)' \
    --arg 'bytearray:$(owner-to-split-signing-key)' \
    --arg 'bytearray:$(owner-to-split-public-key)' \
	--arg 'list:$(partition)' \
    --arg 'base64:$(owner-to-split-resource)' \
	--arg 'bytes:$(logic-proved)' \
	-o $@ \
