## Hello World Web App

### Dependencies

1. [Anoma node](https://github.com/anoma/anoma)

Clone the Anoma node repository and checkout at commit ref `9e7f05da098f6ab5a95d62cb154e129ea5e386ef`:

``` sh
git checkout 9e7f05da098f6ab5a95d62cb154e129ea5e386ef
```

Follow the the [setup instrucions](https://github.com/anoma/anoma?tab=readme-ov-file#compilation-from-sources) for Anoma.

2. [Juvix compiler nightly](https://github.com/anoma/juvix-nightly-builds/releases/tag/nightly-2025-03-31-0.6.10-e8f0faf/)

Download the nightly binary for your platform at the link and put it on your system PATH.

2. [npmjs](https://www.npmjs.com)

``` sh
brew install node
```

3. [envoy proxy](https://www.envoyproxy.io)

```sh
brew install envoy
```

4. [yq](https://mikefarah.gitbook.io/yq)

``` sh
brew install yq
```

### Quickstart

After installing the dependencies follow these steps:

1. Setup `anoma-client`

In the [`anoma-client`](../../anoma-client) directory (in the root of this repository) run:

``` sh
npm install
```

2. Run the web app

Run the following in this directory.

``` sh
npm install # only for the first time
export ANOMA_PATH=<path to Anoma node clone>
make clean  # only for the first time
make anoma-start # start Anoma
make build  # build the Anoma application
make proxy-start   # start the envoy proxy
npm run serve  # serve the webapp at http://localhost:9000
```

You can stop Anoma and the proxy by running:

``` sh
make stop
```
