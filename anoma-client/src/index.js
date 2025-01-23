import { BlockServicePromiseClient, IndexerServicePromiseClient, MempoolServicePromiseClient, NockServicePromiseClient, IntentsServiceClient } from './grpc-client/anoma_grpc_web_pb';

import * as UnspentResources from './grpc-client/indexer/unspent_resources_pb';
import * as UnrevealedCommits from './grpc-client/indexer/unrevealed_commits_pb'
import * as Nullifiers from './grpc-client/indexer/nullifiers_pb'
import * as AddTransaction from './grpc-client/mempool/add_transaction_pb';
import * as Filtered from './grpc-client/indexer/blocks/filter_pb'
import * as Prove from './grpc-client/nock/prove_pb';
import * as Run from './grpc-client/nock/run_pb'
import * as ListIntents from './grpc-client/intents/list_intents_pb'
import * as Root from './grpc-client/indexer/blocks/root_pb'
import * as Latest from './grpc-client/indexer/blocks/latest_pb'
import * as AddIntent from './grpc-client/intents/add_intent_pb';
import * as Intent from './grpc-client/intents/intent_pb';
import * as Dump from './grpc-client/mempool/dump_pb';
import { Input } from './grpc-client/nock/input_pb';
import serial from './nock-js/serial';
import noun from './nock-js/noun';
import bits from './nock-js/bits';

/**
 * Fetches data from a URL.
 *
 * @param {!string} url - The source URL
 * @return {!Promise<!Uint8Array>} The data in the response
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
 * @param {!(string|number|Uint8Array)} x - The value to serialize
 * @return {!Uint8Array} The serialized data
 * */
export function serialize(x) {
  return new Uint8Array(serial.jam(toNoun(x)).bytes());
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
   * Get all unrevealed commits.
   *
   * @return {!Promise<!Array<!Uint8Array>>} A list of commits.
   * */
  async listUnrevealedCommits() {
    const request = new UnrevealedCommits.Request();
    const res = await this.indexerClient.listUnrevealedCommits(request, {});
    return res.getCommitsList_asU8();
  }

/**
   * Get all nullifiers.
   *
   * @return {!Promise<!Array<!Uint8Array>>} A list of nullifiers.
   * */
  async listNullifiers() {
    const request = new Nullifiers.Request();
    const res = await this.indexerClient.listNullifiers(request, {});
    return res.getNullifiersList_asU8();
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
   * @param {!Array<!Uint8Array>} privateInputs - Private inputs to the program.
   * @param {!Array<!Uint8Array>} publicInputs - Public inputs to the program.
   * @return {!Promise<!Result>} The result of proving.
   * */
  async prove(program, privateInputs, publicInputs) {
    const request = new Prove.Request();
    request.setJammedProgram(program);

    const inputPrivateInputs = privateInputs.map(arg => {
      const input = new Input();
      // TODO: We serialize all arguments to match the behaviour of
      // `juvix dev anoma prove`.
      // This should be removed when `juvix dev anoma prove` is fixed.
      // The privateInputs to this function should be serialized exactly once.
      input.setJammed(serialize(arg));
      return input;
    });
    request.setPrivateInputsList(inputPrivateInputs);

    const inputPublicInputs = publicInputs.map(arg => {
      const input = new Input();
      // TODO: We serialize all arguments to match the behaviour of
      // `juvix dev anoma prove`.
      // This should be removed when `juvix dev anoma prove` is fixed.
      // The publicInputs to this function should be serialized exactly once.
      input.setJammed(serialize(arg));
      return input;
    });
    request.setPublicInputsList(inputPublicInputs);

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
   * Submit a program to Anoma for execution.
   *
   * @param {!Uint8Array} program - The program to execute.
   * @param {!Array<!Uint8Array>} args - Arguments to pass to the program.
   * @return {!Promise<!Result>} The result of execution.
   * */
  async run(program, args) {
    const request = new Run.Request();
    request.setJammedProgram(program);
    const inputArgs = args.map(arg => {
      const input = new Input();
      // TODO: We serialize all arguments to match the behaviour of
      // `juvix dev anoma prove`.
      // This should be removed when `juvix dev anoma prove` is fixed.
      // The args to this function should be serialized exactly once.
      input.setJammed(serialize(arg));
      return input;
    });
    request.setInputsList(inputArgs);
    const response = await this.nockClient.run(request, {});
    if (response.getError() !== undefined) {
      const errStr = response.getError().toObject().error;
      throw new ExecutionError(`Nock run failed: ${errStr}`, response.getError().getOutputList_asU8());
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
  async addTransactionCandidate(tx) {
    const request = new AddTransaction.Request();
    request.setTransaction(tx);
    return await this.mempoolClient.add(request, {});
  }

  /**
   * Get all transaction candidates currently in the Anoma mempool.
   *
   * @return {!Promise<!Array<!Uint8Array>>} A list of transaction candidates.
   * */
  async dumpMempool() {
    const request = new DumpMempool.Request();
    const response = await this.mempoolClient.dump(request, {});
    return response.getTransactionCandidatesList_asU8();
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
