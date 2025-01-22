app-path = ..
src = $(app-path)/anoma-build
dst = nockma

anoma-build-dir = anoma-build
anoma-build = $(anoma-build-dir)/.exists

envoy-tag = hello-world-tag
envoy-config-tmpl = envoy.yaml.tmpl
envoy-config = $(anoma-build-dir)/envoy.yaml
anoma-config = $(anoma-build-dir)/anoma-config.yaml
anoma-port = $(anoma-build-dir)/port

add-message-program = HelloWorld.nockma
get-message-program = GetMessage.nockma

add-message-program-src = $(src)/$(add-message-program)
get-message-program-src = $(src)/$(get-message-program)

add-message-program-dst = $(dst)/$(add-message-program)
get-message-program-dst = $(dst)/$(get-message-program)

.PHONY: build
build: $(add-message-program-dst) $(get-message-program-dst)

.PHONY: clean
clean:
	rm -rf $(dst)
	rm -rf $(anoma-build-dir)

.PHONY: start
start: anoma-start proxy-start

.PHONY: stop
stop: anoma-stop proxy-stop

.PHONY: anoma-start
anoma-start:
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

$(add-message-program-dst): $(dst) $(add-message-program-src)
	cp $(add-message-program-src) $(add-message-program-dst)

$(get-message-program-dst): $(dst) $(get-message-program-src)
	cp $(get-message-program-src) $(get-message-program-dst)

$(add-message-program-src):
	make -C $(app-path) compile-add-message

$(get-message-program-src):
	make -C $(app-path) compile-get-message
