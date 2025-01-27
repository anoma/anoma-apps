## AnomaJS Client

This package provides an `AnomaClient` that can be used in the browser to make
gRPC calls to an Anoma client.

### Anoma compatible version

The protobuf files in [`protobuf`](./protobuf) are obtained from [`anoma/anoma:apps/anoma_protobuf/priv/protobuf`](https://github.com/anoma/anoma/tree/8cc25d3fd64ad20623c8135eaa0a6d2096016549/apps/anoma_protobuf/priv/protobuf).

The client has been tested with `anoma/anoma:8cc25d3fd64ad20623c8135eaa0a6d2096016549`

### Generating new gRPC-web bindings

Run the following in the root of the project:

``` sh
npm install
make gen-client
```
