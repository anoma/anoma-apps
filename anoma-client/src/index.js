import { BlockServicePromiseClient, IndexerServicePromiseClient, MempoolServicePromiseClient, NockServicePromiseClient } from './grpc-client/anoma_grpc_web_pb';

import * as UnspentResources from './grpc-client/indexer/unspent_resources_pb.js';
import * as AddTransaction from './grpc-client/mempool/add_transaction_pb.js';
import * as Filtered from './grpc-client/indexer/blocks/filter_pb.js'
import * as Prove from './grpc-client/nock/prove_pb.js';
import { Input } from './grpc-client/nock/input_pb.js';
import serial from './nock-js/serial.js';
import noun from './nock-js/noun.js';
import bits from './nock-js/bits.js';

export async function fetchBinary(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch binary data: ${response.statusText}`);
  }
  const buf = await response.arrayBuffer();
  return new Uint8Array(buf);
}

export function serialize(x) {
  return new Uint8Array(serial.jam(toNoun(x)).bytes());
}

/**
  * Wrap bytes in a Nock ByteArray noun
  *
  * @param {!Uint8Array} bytesPayload - The bytes to wrap.
  * @return {!Noun} The Nock noun representing the ByteArray.
  * */
export function toByteArray(bytesPayload) {
  const payload = bits.bytesToAtom(bytesPayload);
  const length = noun.dwim(bytesPayload.length);
  return new noun.Cell(length, payload);
}

/**
  * Generate random bytes
  *
  * @param {!Number} length - The number of bytes to generate.
  * @return {!Uint8Array} The random bytes.
  * */
export function genRandomBytes(length) {
  var bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function toNoun(x) {
  if (x instanceof Uint8Array) {
    return bits.bytesToAtom(x);
  } else {
    return noun.dwim(x);
  }
}

export function deserializeToString(bs) {
    const resultAtom = bits.bytesToAtom(bs);
    const deserializedAtom = serial.cue(resultAtom);
    const decoder = new TextDecoder('utf-8');
    const decodedString = decoder.decode(new Uint8Array(deserializedAtom.bytes()));
    return decodedString;
}

export class AnomaClient {
  constructor(grpcServer) {
    this.grpcServer = grpcServer;
    this.indexerClient = new IndexerServicePromiseClient(grpcServer);
    this.nockClient = new NockServicePromiseClient(grpcServer);
    this.mempoolClient = new MempoolServicePromiseClient(grpcServer);
    this.blockServiceClient = new BlockServicePromiseClient(grpcServer);
  }

  async listUnspentResources() {
    const request = new UnspentResources.Request();
    const res = await this.indexerClient.listUnspentResources(request, {});
    return res.getUnspentResourcesList_asU8();
  }

  async filterKind(kind) {
    const request = new Filtered.Request();
    const filter = new Filtered.Filter();
    filter.setKind(kind);
    request.setFiltersList([filter]);
    const response = await this.blockServiceClient.filter(request, {});
    return response.getResourcesList_asU8();
  }

  async prove(program, args) {
    const request = new Prove.Request();
    request.setJammedProgram(program);
    let inputArgs = [];
    for (const arg of args) {
      const input = new Input();
      input.setJammed(arg);
      inputArgs.push(input);
    }
    request.setPrivateInputsList(inputArgs);
    request.setPublicInputsList([]);
    const response = await this.nockClient.prove(request, {});
    if (response.getError() !== undefined) {
      const errStr = response.getError().toObject().error;
      throw Error(`Prove request failed: ${errStr}`);
    }
    return response.getSuccess().getResult_asU8();
  }

  async addTransaction(transaction) {
    const request = new AddTransaction.Request();
    request.setTransaction(transaction);
    return await this.mempoolClient.add(request);
  }
}

/**
 * A builder for arguments to AnomaClient.prove.
 */
export class ProveArgsBuilder {
  #args;
  constructor() {
    this.#args = [];
  }

  /**
   * Build the arguments to AnomaClient.prove.
   *
   * @return {Array!<!Uint8Array>} Arguments to pass to AnomaClient.prove
   */
  build() {
    return this.#args;
  }

  /**
   * Add a ByteArray argument
   *
   * @param {!Uint8Array} b - An argument passed as a Nock ByteArray noun.
   * @return {!ProveArgsBuilder} The builder with the argument added
   */
  bytearray(b) {
    return this.#unjammed(toByteArray(b));
  }

  /**
   * Add an unjammed bytes argument
   *
   * @param {!Uint8Array} b - Bytes that represent an unjammed atom
   * @return {!ProveArgsBuilder} The builder with the argument added
   */
  bytesUnjammed(b) {
    return this.#unjammed(b);
  }

  /**
   * Add a string argument as UTF-8 encoded bytes
   *
   * @param {string} s - A string
   * @return {!ProveArgsBuilder} The builder with the argument added
   */
  string(s) {
    const encoder = new TextEncoder('utf-8');
    return this.#unjammed(encoder.encode(s));
  }

  /**
   * Add a bytes argument
   *
   * @param {!Uint8Array} b - Bytes that represent a jammed noun
   * @return {!ProveArgsBuilder} The builder with the argument added
   */
  bytes(b) {
    return this.#jammed(b);
  }

  /**
   * Add a non-negative integer argument
   *
   * @param {number} n - A non-negative integer
   * @return {!ProveArgsBuilder} The builder with the argument added
   */
  nat(n) {
    return this.#unjammed(n);
  }

  /**
   * Add a list of jammed nouns argument
   *
   * @param {!Array<!Uint8Array>} xs - An array of bytes representing jammed nouns
   * @return {!ProveArgsBuilder} The builder with the argument added
   */
  list(xs) {
    // The Nock atom 0 is the representation of the empty list.
    var nockList = toNoun(0);
    // The list is reversed because we are folding right:
    // [1,2,3] -> [1 [2 [3 0]]]
    for (const x of xs.reverse()) {
      nockList = new Cell(toNoun(x), nockList);
    }
    return this.#unjammed(nockList);
  }

  /**
   * Add an unjammed argument
   *
   * @param {any} x - An unjammed noun
   * @return {!ProveArgsBuilder} The builder with the argument added
   */
  #unjammed(x) {
    this.#args.push(serialize(x));
    return this;
  }

  /**
   * Add a jammed argument
   *
   * @param {any} x - A jammed noun
   * @return {!ProveArgsBuilder} The builder with the argument added
   */
  #jammed(x) {
    this.#args.push(x);
    return this;
  }

}
