import { IndexerServicePromiseClient, MempoolServicePromiseClient, NockServicePromiseClient } from './grpc-client/anoma_grpc_web_pb';

import * as UnspentResources from './grpc-client/indexer/unspent_resources_pb.js';
import * as AddTransaction from './grpc-client/mempool/add_transaction_pb.js';
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
  return await response.arrayBuffer();
}

export class AnomaClient {
  constructor(grpcServer) {
    this.grpcServer = grpcServer;
    this.indexerClient = new IndexerServicePromiseClient(grpcServer);
    this.nockClient = new NockServicePromiseClient(grpcServer);
    this.mempoolClient = new MempoolServicePromiseClient(grpcServer);
  }

  async listUnspentResources() {
    const request = new UnspentResources.Request();
    const res = await this.indexerClient.listUnspentResources(request, {});
    return res.getUnspentResourcesList();
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
    if (response.error !== undefined) {
      throw Error(`Prove request failed: $(response.error}`);
    }
    const result = response.getSuccess().getResult();
    const resultAtom = bits.bytesToAtom(result);
    return serial.cue(resultAtom);
  }

  async addTransaction(transaction) {
    const request = new AddTransaction.Request();
    request.setTransaction(transaction);
    return await this.mempoolClient.add(request);
  }
}
