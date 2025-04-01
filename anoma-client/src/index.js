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
  Crypto.getRandomValues(bytes);
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
