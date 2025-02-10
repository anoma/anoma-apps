# Split:
#
# make anoma-start
# make quantity=13 owner-id=bob kudos-initialize  # create 13 of bob kudos owned by bob
# make get-balance owner-id=bob  # this should contain 1 resource
# make split-spec=split.yaml kudos-split  # splits resources according to Kudos/split.yaml
# # the following assumes you used the default split.yaml file
# make get-balance owner-id=bob  # should now be empty
# make get-balance owner-id=albertros  # should now show 'bob : 10'
# make get-balance owner-id=caracalla  # should now show 'bob : 3'
# make owner-id=bob merge-id=caracalla kudos-merge

ANOMA_PATH ?= $(error set the ANOMA_PATH variable to a path to an anoma clone)
ANOMA_DEBUG ?=
owner-id ?= 0
receiver-id ?= 0
quantity ?= $(error set the quantity variable to a number)
root = $(shell pwd)
split-spec ?= split.yaml
merge-id ?= 0
# block-height is used by has-transaction-after-height
block-height ?= $(error set the block-height variable)

base-path = Kudos
logic = Logic
create = Create
transfer = Transfer
make-part = MakePart
split = Split
merge = Merge
kudos-kind = KudosKind
get-balance = GetBalance

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

merge-juvix = $(base-path)/$(merge).juvix
merge-nockma = $(anoma-build-dir)/$(merge).nockma
merge-proved = $(anoma-build-dir)/$(merge).proved.nockma

make-part-juvix = $(base-path)/$(make-part).juvix
make-part-nockma = $(anoma-build-dir)/$(make-part).nockma
make-part-proved = $(anoma-build-dir)/$(make-part).proved.nockma

kudos-kind-juvix = $(base-path)/$(kudos-kind).juvix
kudos-kind-nockma = $(anoma-build-dir)/$(kudos-kind).nockma

split-juvix = $(base-path)/$(split).juvix
split-nockma = $(anoma-build-dir)/$(split).nockma

get-balance-juvix = $(base-path)/$(get-balance).juvix
get-balance-nockma = $(anoma-build-dir)/$(get-balance).nockma
get-balance-proved = $(anoma-build-dir)/$(get-balance).proved.nockma
get-balance-proved-txt = $(anoma-build-dir)/$(get-balance).proved.txt

resource-to-split = $(anoma-build-dir)/resource-to-split

unspent-resources = $(anoma-build-dir)/unspent-resources

get-latest-root = $(anoma-build-dir)/latest-root
latest-block-height = $(anoma-build-dir)/latest-block-height
has-transaction-after-height = $(anoma-build-dir)/has-transaction-after-height

port = $(anoma-build-dir)/port
host = $(anoma-build-dir)/host

all-juvix = $(shell find . -name '*.juvix')

owner-request = $(anoma-build-dir)/owner-request.json
owner-id-file = $(anoma-build-dir)/owner-id
owner-balance-resources = $(anoma-build-dir)/owner-balance-resources
owner-first-resource = $(anoma-build-dir)/owner-balance-resources-first

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

to-merge-public-key = $(anoma-build-dir)/to-merge-public-key
to-merge-resources-request = $(anoma-build-dir)/to-merge-resources-request
to-merge-kudos-symbol = $(anoma-build-dir)/to-merge-kudos-symbol
to-merge-resources = $(anoma-build-dir)/to-merge-resources
to-merge-kind-cued-proved-base64 = $(anoma-build-dir)/to-merge-kind-cued-proved-base64
merge-kudos-kind-proved = $(anoma-build-dir)/merge-kudos-kind-proved

# hack to make the makefile check if this is set
$(ANOMA_PATH):

# documented hack to force recipes to run for recipes that have prerequisites
# with patterns
FORCE:

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

.PHONY: get-balance-resources
get-balance-resources: $(owner-balance-resources)
	@cat $(owner-balance-resources)

.PHONY: get-balance
get-balance: $(get-balance-proved-txt)
	@cat $<

.PHONY: kudos-initialize
kudos-initialize: $(create-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(create-proved)

.PHONY: kudos-transfer
kudos-transfer: $(transfer-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(transfer-proved)

.PHONY: kudos-split
kudos-split: $(split-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(split-proved)

.PHONY: kudos-merge
kudos-merge: $(merge-proved) $(config)
	juvix dev anoma -c $(config) add-transaction $(merge-proved)

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

.PHONY: latest-block-height
latest-block-height: $(latest-block-height)
	@cat $<

.PHONY: $(latest-block-height)
$(latest-block-height): $(anoma-build) $(host) $(port)
	@grpcurl -plaintext $$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.BlockService.Latest \
	| jq -r '.block.height' \
	| tr -d '\n' \
	> $@

.PHONY: has-transaction-after-height
has-transaction-after-height: $(has-transaction-after-height)
	@cat $<

.PHONY: $(has-transaction-after-height)
$(has-transaction-after-height): $(anoma-build) $(host) $(port)
	grpcurl -plaintext \
	-d @ \
	$$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.BlockService.Get \
	<<< '{"after": $(block-height)}' \
	| jq '.blocks | map(has("transactions")) | any' \
	| tr -d '\n' \
	> $@

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
$(owner-first-resource): $(owner-balance-resources)
	test -s $(owner-balance-resources)
	head -n1 $(owner-balance-resources) > $(owner-first-resource)

get-first-resource: $(owner-first-resource)
	@cat $(owner-first-resource)

.PHONY: $(owner-balance-resources)
$(owner-balance-resources): $(anoma-build) $(host) $(port) $(owner-request)
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

$(person-public-der)-%: $(person-secret-der)-% FORCE
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

.PHONY: $(merge-public-key)
$(merge-public-key): $(person-public-key)-$(merge-id)
	cp $< $@

$(split-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(split-juvix) -o $(split-nockma)

$(make-part-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(make-part-juvix) -o $(make-part-nockma)

$(owner-to-split-signing-key): $(addprefix $(person-signing-key)-, $(shell yq -r '.owner' < $(split-spec) | tr -d '\n'))
	cp $< $@

$(owner-to-split-public-key): $(addprefix $(person-public-key)-, $(shell yq -r '.owner' < $(split-spec) | tr -d '\n'))
	cp $< $@

$(owner-to-split-public-key-base64): $(owner-to-split-public-key)
	base64 < $< | tr -d "\n\r" > $@

$(kudos-kind-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(kudos-kind-juvix) -o $(kudos-kind-nockma)

$(owner-to-split-kudos-symbol): $(split-spec)
	yq -r '.owner' < $(split-spec) | tr -d '\n' > $@

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

$(partition): $(addprefix $(make-named-part-base64)-, $(shell yq -r '.partition | keys[]' < $(split-spec)))
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

$(merge-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(merge-juvix) -o $(merge-nockma)

$(to-merge-public-key): $(person-public-key)-$(merge-id)
	cp $< $@

.PHONY: $(to-merge-kudos-symbol)
$(to-merge-kudos-symbol):
	echo $(merge-id) | tr -d '\n' > $@

$(merge-kudos-kind-proved): $(kudos-kind-nockma) $(config) $(logic-proved) $(to-merge-public-key) $(to-merge-kudos-symbol)
	juvix dev anoma -c $(config) prove $(kudos-kind-nockma) \
	--arg 'bytes:$(logic-proved)' \
	--arg 'bytearray:$(to-merge-public-key)' \
	--arg 'bytes-unjammed:$(to-merge-kudos-symbol)' \
	-o $@

$(to-merge-kind-cued-proved-base64): $(merge-kudos-kind-proved)
	juvix dev nockma encode --cue --from bytes --to base64 < $< > $@

$(to-merge-resources-request): $(owner-public-key-base64) $(to-merge-kind-cued-proved-base64)
	jq -n \
	--arg OWNER $$(cat $(owner-public-key-base64)) \
	--arg KIND $$(cat $(to-merge-kind-cued-proved-base64)) \
	'{node_info: {node_id: ""}, filters: [{owner: $$OWNER}, {kind: $$KIND}]}' \
	> $@ \

.PHONY: $(to-merge-resources)
$(to-merge-resources): $(host) $(port) $(to-merge-resources-request)
	grpcurl -plaintext \
	-d @ \
	$$(cat $(host)):$$(cat $(port)) Anoma.Protobuf.BlockService.Filter \
	< $(to-merge-resources-request) \
	| jq -r 'try .resources[]' \
	> $@

$(merge-proved): $(merge-nockma) $(random-32bytes) $(get-latest-root) $(logic-proved) $(owner-signing-key) $(owner-public-key) $(receiver-public-key) $(to-merge-resources)
	juvix dev anoma -c $(config) prove $(merge-nockma) \
	--arg 'base64-unjammed:$(get-latest-root)' \
	--arg 'bytes-unjammed:$(random-32bytes)' \
    --arg 'bytearray:$(owner-signing-key)' \
    --arg 'bytearray:$(owner-public-key)' \
	--arg 'list:$(to-merge-resources)' \
    --arg 'bytearray:$(receiver-public-key)' \
	--arg 'bytes:$(logic-proved)' \
	-o $@ \

$(get-balance-nockma): $(anoma-build) $(all-juvix)
	juvix compile anoma $(get-balance-juvix) -o $(get-balance-nockma)

$(get-balance-proved): $(config) $(get-balance-nockma) $(owner-balance-resources)
	juvix dev anoma -c $(config) prove $(get-balance-nockma) \
	--arg 'list:$(owner-balance-resources)' \
	-o $@

$(get-balance-proved-txt): $(get-balance-proved)
	juvix dev nockma encode --cue --from bytes --to bytes < $< > $@
