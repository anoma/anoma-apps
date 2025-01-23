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

  async addTransaction(transaction) {
    const request = new AddTransaction.Request();
    request.setTransaction(transaction);
    return await this.mempoolClient.add(request);
  }
}
