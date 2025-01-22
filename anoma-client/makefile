# Dependencies:
# protoc - The protobuf compiler >= 29.2
# Run `npm install` in the root of the project

ANOMA_GRPC_PORT ?= $(error set ANOMA_GRPC_PORT)

src ?= ./protobuf
dst ?= ./src/grpc-client

node-modules-bin = node_modules/.bin
protoc-gen-js = $(node-modules-bin)/protoc-gen-js
protoc-gen-grpc-web = $(node-modules-bin)/protoc-gen-grpc-web

.PHONY: clean
clean:
	rm -rf $(dist)
	rm -rf $(external)

.PHONY: gen-client
gen-client:
	mkdir -p $(dst)
	protoc -I=$(src) \
	--plugin='protoc-gen-js=$(protoc-gen-js)' \
	--plugin='protoc-gen-grpc-web=$(protoc-gen-grpc-web)' \
	--js_out=import_style=commonjs:$(dst) \
	--grpc-web_out=import_style=commonjs,mode=grpcwebtext:$(dst) \
	$(shell find $(src) -name '*.proto')
