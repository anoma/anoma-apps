import { BlockServicePromiseClient, IndexerServicePromiseClient, IntentsServiceClient, MempoolServicePromiseClient, NockServicePromiseClient } from './grpc-client/anoma_grpc_web_pb';
import * as Filtered from './grpc-client/indexer/blocks/filter_pb';
import * as Latest from './grpc-client/indexer/blocks/latest_pb';
import * as Root from './grpc-client/indexer/blocks/root_pb';
import * as UnspentResources from './grpc-client/indexer/unspent_resources_pb';
import * as AddIntent from './grpc-client/intents/add_intent_pb';
import * as Intent from './grpc-client/intents/intent_pb';
import * as ListIntents from './grpc-client/intents/list_intents_pb';
import * as AddTransaction from './grpc-client/mempool/add_transaction_pb';
import { Input } from './grpc-client/nock/input_pb';
import * as Prove from './grpc-client/nock/prove_pb';
import bits from './nock-js/bits';
import noun from './nock-js/noun';
import serial from './nock-js/serial';

/**
 * Fetches data from a URL.
 *
 * @param {!string} url - The source URL
 * @return {!Promise<!Uint8Array>} The data in the response
 * */
export async function fetchBinary(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch binary data: ${response.statusText}`);
  }
  const buf = await response.arrayBuffer();
  return new Uint8Array(buf);
}

/**
 * Nock serialize (i.e jam) a value.
 *
 * @param {!(string|number|Uint8Array)} x - The value to serialize
 * @return {!Uint8Array} The serialized data
 * */
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

/**
 * Transform a value to a nock-js noun.
 *
 * A Uint8Array value must be the bytes of a nock atom.
 *
 * @param {!(string|number|Uint8Array)} x - The value to transform.
 * @return {!Noun} The corresponding nock-js Noun.
 * */
function toNoun(x) {
  if (x instanceof Uint8Array) {
    return bits.bytesToAtom(x);
  } else {
    return noun.dwim(x);
  }
}

/**
 * Nock deserialize (i.e cue) data to a String.
 *
 * The data should be nock serialized utf-8 bytes.
 *
 * @param {!Uint8Array} bs - The data to deserializze
 * @return {!string} The deserialized string
 * */
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
    this.intentsServiceClient = new IntentsServiceClient(grpcServer);
  }

  /**
   * Get all unspent resources.
   *
   * @return {!Promise<!Array<!Uint8Array>>} A list of Resources
   * */
  async listUnspentResources() {
    const request = new UnspentResources.Request();
    const res = await this.indexerClient.listUnspentResources(request, {});
    return res.getUnspentResourcesList_asU8();
  }

  /**
   * Get all resources that match the given filters
   *
   * @param {!Array<!Uint8Array>} kinds - A list of resource kinds to match.
   * @param {!Array<!Uint8Array>} owners - A list of resource owners to match.
   * @return {!Promise<!Array<!Uint8Array>} A list of matched resources.
   * */
  async filter(kinds, owners) {
    const request = new Filtered.Request();

    const kindFilters = kinds.map(kind => {
      const filter = new Filtered.Filter();
      filter.setKind(kind);
      return filter;
    });

    const ownerFilters = owners.map(owner => {
      const filter = new Filtered.Filter();
      filter.setOwner(owner);
      return filter;
    })

    request.setFiltersList(kindFilters.concat(ownerFilters));
    const response = await this.blockServiceClient.filter(request, {});
    return response.getResourcesList_asU8();
  }

  /**
   * @typedef {Object} Result
   * @property {Uint8Array} data - The data of the result.
   * @property {!Array<!Uint8Array>} traces - A list of traces output during execution.
   * */

  /**
   * Submit a program to Anoma for proving.
   *
   * @param {!Uint8Array} program - The program to prove.
   * @param {!Array<!Uint8Array>} args - Inputs to the program.
   * @return {!Promise<!Result>} The result of proving.
   * */
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
      throw new ExecutionError(`Prove request failed: ${errStr}`, response.getError().getOutputList_asU8());
    }
    const successResponse = response.getSuccess();
    return {
      data: successResponse.getResult_asU8(),
      traces: successResponse.getOutputList_asU8()
    };
  }

  /**
   * Submit a transaction candidate to the Anoma mempool.
   *
   * @param {!Promise<!Uint8Array>} tx - The transaction candidate to submit.
   * */
  async addTransaction(transaction) {
    const request = new AddTransaction.Request();
    request.setTransaction(transaction);
    return await this.mempoolClient.add(request);
  }

  /**
   * Get all intents from the intent pool.
   *
   * @return {!Promise<!Array<!Uint8Array>>} A list of intents.
   * */
  async listIntents() {
    const request = new ListIntents.Request();
    const response = await this.intentsServiceClient.listIntents(request, {});
    return response.getIntentsList_asU8();
  }

  /**
   * Add an intent to the intent pool.
   *
   * @param {!Promise<!Uint8Array>} intent - The intent to add.
   * */
  async addIntent(intent) {
    const newIntent = new Intent();
    newIntent.setIntent(intent);
    const request = new AddIntent.Request();
    request.setIntent(intent);
    return await this.intentsServiceClient.addIntent(request);
  }

  /**
   * Get the current root of the commitment tree.
   *
   * @return {!Promise<!Uint8Array>} The current root
   * */
  async getRoot() {
    const request = new Root.Request();
    const response = await this.blockServiceClient.root(request, {});
    return response.getRoot_asU8();
  }

  /**
   * Get the latest block from the chain.
   *
   * @return {!Promise<!Block>} The latest block.
   * */
  async getLatest() {
    const request = new Latest.Request();
    const response = await this.blockServiceClient.latest(request, {});
    return response.getBlock();
  }
}

class ExecutionError extends Error {
  /**
   * @param {string} message - The error message.
   * @param {!Array<!Uint8Array>} traces - A list of traces.
   */
  constructor(message, traces) {
    super(message);
    this.name = "ExecutionError";
    this.traces = traces;
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
      nockList = new noun.Cell(toNoun(x), nockList);
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
