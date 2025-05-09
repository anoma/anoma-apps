# how to run:
# 1. set ANOMA_PATH environment variable to the folder where anoma is cloned and compiled (branch origin/artem/juvix-node-integration-v0.28)
# 2. make anoma-start # start an anoma node
# 3. make counter_id=0 create-consumable-resource # this creates a new counter identity for a counter with id=0
# 4. make counter_id=0 counter-initialize # initialize the counter with id=0
# 5. make counter_id=0 counter-get # get the initial value of the counter (0)
# 6. make counter_id=0 counter-increment # increment the counter with id=0
# 7. make counter_id=0 counter-get # get the current value of counter with id=0 (1)
# 8. make counter_id=1 create-consumable-resource # this creates a new counter identity for a counter with id=1
# 9. make counter_id=1 counter-initialize # initialize with counter with id=1
#10. make counter_id=1 counter-get # get the current value of counter with id=1 (0)
#11. make counter_id=1 counter-increment # increment the counter with id=1
#12. make counter_id=1 counter-get # get the current value of counter with id=1 (1)
#13. make counter_id=0 counter-increment # increment the counter with id=0
#14. make counter_id=0 counter-increment # increment the counter with id=0
#15. make counter_id=0 counter-get # get the current value of counter with id=0 (3)
#16. make counter_id=1 counter-get # get the current value of counter with id=1 (1)
ANOMA_PATH ?= $(error set the ANOMA_PATH variable to a path to an anoma clone)
ANOMA_DEBUG ?=

ifneq ($(XDG_CONFIG_HOME),)
    juvix-cmd = XDG_CONFIG_HOME=$(XDG_CONFIG_HOME) juvix
else
    juvix-cmd = juvix
endif

# Change this to create a new counter identity
counter_id ?= 0

consumable = Consumable
consumable-transaction = ConsumableTransaction
logic = Logic
initialize = Initialize
increment = Increment
counter-kind = CounterKind
get-count = GetCount

base-path = .

anoma-build-dir = anoma-build
anoma-build = $(anoma-build-dir)/.exists
root = $(shell pwd)

config = $(anoma-build-dir)/config.yaml
anoma-config = $(ANOMA_PATH)/config.yaml

random-32bytes = $(anoma-build-dir)/random-32bytes-$(counter_id)
random-32bytes-initialize = $(anoma-build-dir)/random-32bytes-initialize-$(counter_id)
random-32bytes-increment = $(anoma-build-dir)/random-32bytes-increment-$(counter_id)

consumable-juvix = $(base-path)/$(consumable).juvix
consumable-nockma = $(anoma-build-dir)/$(consumable).nockma
consumable-proved = $(anoma-build-dir)/$(consumable)-$(counter_id).proved.nockma

consumable-transaction-juvix = $(base-path)/$(consumable-transaction).juvix
consumable-transaction-nockma = $(anoma-build-dir)/$(consumable-transaction).nockma
consumable-transaction-proved = $(anoma-build-dir)/$(consumable-transaction)-$(counter_id).proved.nockma

logic-juvix = $(base-path)/$(logic).juvix
logic-nockma = $(anoma-build-dir)/$(logic).nockma
logic-proved = $(anoma-build-dir)/$(logic).proved.nockma

initialize-juvix = $(base-path)/$(initialize).juvix
initialize-nockma = $(anoma-build-dir)/$(initialize).nockma
initialize-proved = $(anoma-build-dir)/$(initialize)-$(counter_id).proved.nockma

increment-juvix = $(base-path)/$(increment).juvix
increment-nockma = $(anoma-build-dir)/$(increment).nockma
increment-proved = $(anoma-build-dir)/$(increment)-$(counter_id).proved.nockma

counter-kind-juvix = $(base-path)/$(counter-kind).juvix
counter-kind-nockma = $(anoma-build-dir)/$(counter-kind).nockma
counter-kind-proved = $(anoma-build-dir)/$(counter-kind)-$(counter_id).proved.nockma
counter-kind-proved-cued-b64 = $(anoma-build-dir)/$(counter-kind)-$(counter_id).proved.nockma.b64

get-count-juvix = $(base-path)/$(get-count).juvix
get-count-nockma = $(anoma-build-dir)/$(get-count).nockma
get-count-proved = $(anoma-build-dir)/$(get-count)-$(counter_id).proved.nockma
get-count-result = $(anoma-build-dir)/$(get-count)-$(counter_id).result

current-counter-request = $(anoma-build-dir)/current-counter-request-$(counter_id).json

current-counter = $(anoma-build-dir)/current-counter-$(counter_id)
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
	$(juvix-cmd) dev anoma -c $(config) add-transaction $(consumable-transaction-proved)

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

$(config): $(anoma-build)
ifdef ANOMA_DEBUG
	cp $(anoma-config) $(config)
else
	$(juvix-cmd) dev anoma print-config > $(config)
endif

$(host): $(config)
	@yq -r '.url' $(config) | tr -d '\n' > $(host)

$(port): $(config)
	@yq -r '.port' $(config) | tr -d '\n' > $(port)

$(random-32bytes): $(anoma-build)
	dd bs=1 count=32 \
	< /dev/urandom \
	> $(random-32bytes)

$(random-32bytes-initialize): $(anoma-build)
	dd bs=1 count=32 \
	< /dev/urandom \
	> $(random-32bytes-initialize)

$(random-32bytes-increment): $(anoma-build)
	dd bs=1 count=32 \
	< /dev/urandom \
	> $(random-32bytes-increment)

$(current-counter-request): $(anoma-build) $(counter-kind-proved-cued-b64)
	jq -n --arg KIND $$(cat $(counter-kind-proved-cued-b64)) \
	'{filters: [{kind: $$KIND}]}' \
	> $(current-counter-request)

.PHONY: $(current-counter)
$(current-counter): $(anoma-build) $(host) $(port) $(current-counter-request)
	curl -X POST \
	$$(cat $(host)):$$(cat $(port))/indexer/filter-resources \
	-H "accept: application/json" \
	-H "Content-Type: application/json" \
	-d @- \
	< $(current-counter-request) \
	| jq -r 'try .resources[]' \
	> $(current-counter)

$(consumable-nockma): $(anoma-build) $(consumable-juvix)
	$(juvix-cmd) compile anoma $(consumable-juvix) -o $(consumable-nockma)

$(consumable-proved): $(config) $(random-32bytes) $(consumable-nockma)
	$(juvix-cmd) dev anoma -c $(config) prove $(consumable-nockma) -o $(consumable-proved) --arg "bytes-unjammed:$(random-32bytes)"

$(consumable-transaction-nockma): $(anoma-build) $(all-juvix)
	$(juvix-cmd) compile anoma $(consumable-transaction-juvix) -o $(consumable-transaction-nockma)

$(consumable-transaction-proved): $(get-latest-root) $(config) $(consumable-transaction-nockma) $(consumable-proved)
	$(juvix-cmd) dev anoma -c $(config) prove $(consumable-transaction-nockma) -o $(consumable-transaction-proved) \
	--arg "base64-unjammed:$(get-latest-root)" \
	--arg "bytes:$(consumable-proved)"

$(logic-nockma): $(anoma-build) $(all-juvix)
	$(juvix-cmd) compile anoma $(logic-juvix) -o $(logic-nockma)

$(logic-proved): $(logic-nockma) $(config)
	$(juvix-cmd) dev anoma -c $(config) prove $(logic-nockma) -o $(logic-proved)

.PHONY: get-latest-root
get-latest-root: $(get-latest-root)
	@cat $(get-latest-root)

.PHONY: $(get-latest-root) $(host) $(port)
$(get-latest-root): $(anoma-build) $(host) $(port)
	curl -X GET $$(cat $(host)):$$(cat $(port))/indexer/root \
	| jq -r '.root' \
	> $(get-latest-root)

$(initialize-nockma): $(anoma-build) $(all-juvix)
	$(juvix-cmd) compile anoma $(initialize-juvix) -o $(initialize-nockma)

$(initialize-proved): $(initialize-nockma) $(logic-proved) $(random-32bytes-initialize) $(consumable-proved) $(get-latest-root) $(config)
	$(juvix-cmd) dev anoma -c $(config) prove $(initialize-nockma) -o $(initialize-proved) \
	--arg "bytes-unjammed:$(random-32bytes-initialize)" \
	--arg "bytes:$(consumable-proved)" \
    --arg "bytes:$(logic-proved)" \
	--arg "base64-unjammed:$(get-latest-root)"

$(increment-nockma): $(anoma-build) $(all-juvix)
	$(juvix-cmd) compile anoma $(increment-juvix) -o $(increment-nockma)

$(increment-proved): $(increment-nockma) $(logic-proved) $(random-32bytes-increment) $(current-counter) $(get-latest-root) $(config)
	$(juvix-cmd) dev anoma -c $(config) prove $(increment-nockma) -o $(increment-proved) \
	--arg "bytes-unjammed:$(random-32bytes-increment)" \
	--arg "base64:$(current-counter)" \
    --arg "bytes:$(logic-proved)" \
	--arg "base64-unjammed:$(get-latest-root)"

$(counter-kind-nockma): $(anoma-build) $(all-juvix)
	$(juvix-cmd) compile anoma $(counter-kind-juvix) -o $(counter-kind-nockma)

.PHONY: $(counter-kind-proved)
$(counter-kind-proved): $(counter-kind-nockma) $(logic-proved) $(consumable-proved) $(config)
	$(juvix-cmd) dev anoma -c $(config) prove $(counter-kind-nockma) -o $(counter-kind-proved) \
	--arg "bytes:$(consumable-proved)" \
    --arg "bytes:$(logic-proved)"

$(counter-kind-proved-cued-b64): $(counter-kind-proved)
	$(juvix-cmd) dev nockma encode --cue --from bytes --to base64 < $(counter-kind-proved) > $(counter-kind-proved-cued-b64)

$(get-count-nockma): $(anoma-build) $(all-juvix)
	$(juvix-cmd) compile anoma $(get-count-juvix) -o $(get-count-nockma)

$(get-count-proved): $(current-counter) $(get-count-nockma) $(config)
	$(juvix-cmd) dev anoma -c $(config) prove $(get-count-nockma) -o $(get-count-proved) --arg "base64:$(current-counter)"

$(get-count-result): $(get-count-proved)
	$(juvix-cmd) dev nockma encode --from bytes --to text < $(get-count-proved) > $(get-count-result)
