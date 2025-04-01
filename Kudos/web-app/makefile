app-path = ..
src = $(app-path)/anoma-build
dst = nockma

anoma-build-dir = anoma-build
anoma-build = $(anoma-build-dir)/.exists

envoy-tag = kudos-tag
envoy-config-tmpl = envoy.yaml.tmpl
envoy-config = $(anoma-build-dir)/envoy.yaml
anoma-config = $(anoma-build-dir)/anoma-config.yaml
anoma-port = $(anoma-build-dir)/port

kudos-create-program = Create.nockma
logic-program = Logic.proved.nockma

kudos-create-program-src = $(src)/$(kudos-create-program)
logic-program-src = $(src)/$(logic-program)
kind-src = $(src)/$(kind)

kudos-create-program-dst = $(dst)/$(kudos-create-program)
logic-program-dst = $(dst)/$(logic-program)

.PHONY: build
build: $(kudos-create-program-dst) $(logic-program-dst)

.PHONY: clean
clean:
	make -C $(app-path) clean
	rm -rf $(dst)
	rm -rf $(anoma-build-dir)

.PHONY: stop
stop: anoma-stop proxy-stop

.PHONY: anoma-start
anoma-start:
	rm -f $(anoma-config)
	make -C $(app-path) anoma-start

.PHONY: anoma-stop
anoma-stop:
	make -C $(app-path) anoma-stop

.PHONY: proxy-start
proxy-start: $(envoy-config)
	envoy -c $(envoy-config) -l off -- $(envoy-tag) &

.PHONY: proxy-stop
proxy-stop:
	pkill -f $(envoy-tag)

$(anoma-build):
	mkdir -p $(anoma-build-dir)
	touch $(anoma-build)

$(dst):
	mkdir -p $(dst)

$(anoma-config): $(anoma-build)
	juvix dev anoma print-config > $(anoma-config)

$(anoma-port): $(anoma-config)
	yq -r '.port' $(anoma-config) | tr -d '\n' > $(anoma-port)

$(envoy-config): $(anoma-build) $(anoma-port)
	sed "s/__ANOMA_PORT__/$(shell cat $(anoma-port))/" $(envoy-config-tmpl) > $(envoy-config)

$(kudos-create-program-dst): $(dst) $(kudos-create-program-src)
	cp $(kudos-create-program-src) $(kudos-create-program-dst)

$(get-message-program-dst): $(dst) $(get-message-program-src)
	cp $(get-message-program-src) $(get-message-program-dst)

$(logic-program-dst): $(dst) $(logic-program-src)
	cp $(logic-program-src) $(logic-program-dst)

$(kind-dst): $(dst) $(kind-src)
	cp $(kind-src) $(kind-dst)

$(kudos-create-program-src):
	make -C $(app-path) compile-kudos-create

$(logic-program-src):
	make -C $(app-path) compile-logic
