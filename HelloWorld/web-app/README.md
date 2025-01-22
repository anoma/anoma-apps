## Hello World Web App

### Dependencies

1. [Anoma node](https://github.com/anoma/anoma)

This should be cloned at commit `7fdd77377317ff0e29676a403b384cb1f2dc4729` and
the [setup instrucions](https://github.com/anoma/anoma?tab=readme-ov-file#compilation-from-sources) should be followed.

2. [Juvix compiler nightly](https://github.com/anoma/juvix-nightly-builds/releases/tag/nightly-2025-01-22-0.6.9-88de274)

Download the nightly binary for your platform at the link and put it on your system PATH.

2. [npmjs](https://www.npmjs.com)

``` sh
brew install node
```

3. [envoy proxy](https://www.envoyproxy.io)

``` sh
brew install envoy
```

4. [yq](https://mikefarah.gitbook.io/yq)

``` sh
brew install yq
```

### Quickstart

After install the dependencies, run the following in the repository root.

``` sh
npm install
make build  # build the Anoma application
export ANOMA_PATH=<path to Anoma node clone>
make start   # start the Anoma node / client and the envoy proxy
npm run serve  # serve the webapp at http://localhost:9000
```

You can stop Anoma and the proxy by running:

``` sh
make stop

```
