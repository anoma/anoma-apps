## AnomaJS Client

This package provides an `AnomaClient` that can be used in the browser to make
gRPC calls to an Anoma client.

### Anoma compatible version

The protobuf files in [`protobuf`](./protobuf) are obtained from [`anoma/anoma:apps/anoma_protobuf/priv/protobuf`](https://github.com/anoma/anoma/tree/7fdd77377317ff0e29676a403b384cb1f2dc4729/apps/anoma_protobuf/priv/protobuf).

The client has been tested with `anoma/anoma:7fdd77377317ff0e29676a403b384cb1f2dc4729`

### Generating new gRPC-web bindings

Run the following in the root of the project:

``` sh
npm install
make gen-client
```
