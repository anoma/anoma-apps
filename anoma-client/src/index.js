import { BlockServicePromiseClient, IndexerServicePromiseClient, MempoolServicePromiseClient, NockServicePromiseClient } from './grpc-client/anoma_grpc_web_pb';

import * as UnspentResources from './grpc-client/indexer/unspent_resources_pb';
import * as AddTransaction from './grpc-client/mempool/add_transaction_pb';
import * as Filtered from './grpc-client/indexer/blocks/filter_pb'
import * as Prove from './grpc-client/nock/prove_pb';
import { Input } from './grpc-client/nock/input_pb';
import serial from './nock-js/serial';
import noun from './nock-js/noun';
import bits from './nock-js/bits';

/**
 * Fetches data from a URL.
 *
 * @param {!string} url The source URL
 * @return {!Uint8Array} The data in the response
 * */
export async function fetchBytes(url) {
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
 * @param {!(string|number|Uint8Array)} x The value to serialize
 * @return {!Uint8Array} The serialized data
 * */
export function serialize(x) {
  return new Uint8Array(serial.jam(toNoun(x)).bytes());
}

/**
 * Transform a value to a nock-js noun
 *
 * A Uint8Array value must be the bytes of a nock atom.
 *
 * @param {!(string|number|Uint8Array)} x The value to transform.
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
 * Nock deserialize (i.e cue) data to a String
 *
 * The data should be nock serialized utf-8 bytes.
 *
 * @param {!Uint8Array} bs The data to deserializze
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
  }

  /**
   * Get all unspent resources.
   *
   * @return {!Array<Uint8Array>} A list of Resources
   * */
  async listUnspentResources() {
    const request = new UnspentResources.Request();
    const res = await this.indexerClient.listUnspentResources(request, {});
    return res.getUnspentResourcesList_asU8();
  }

  /**
   * Get all resources of a specified kind
   *
   * @param {!Uint8Array} kind The kind to match.
   * @return {!Array<Uint8Array>} The resources that match.
   * */
  async filterKind(kind) {
    const request = new Filtered.Request();
    const filter = new Filtered.Filter();
    filter.setKind(kind);
    request.setFiltersList([filter]);
    const response = await this.blockServiceClient.filter(request, {});
    return response.getResourcesList_asU8();
  }

  /**
   * Submit a program to Anoma for proving
   *
   * @param {!Uint8Array} program The program to prove.
   * @param {!Array<Uint8Array>} args Private inputs to the program.
   * */
  async prove(program, args) {
    const request = new Prove.Request();
    request.setJammedProgram(program);
    let inputArgs = [];
    for (const arg of args) {
      const input = new Input();
      // TODO: We serialize all arguments to match the behaviour of
      // `juvix dev anoma prove`.
      // This should be removed when `juvix dev anoma prove` is fixed.
      // The args to this function should be serialized exactly once.
      input.setJammed(serialize(arg));
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

  /**
   * Submit a transaction to the Anoma mempool
   *
   * @param {!Uint8Array} transaction The transaction to submit.
   * */
  async addTransaction(transaction) {
    const request = new AddTransaction.Request();
    request.setTransaction(transaction);
    return await this.mempoolClient.add(request);
  }
}
