import { AnomaClient, deserializeToString, fetchBinary, serialize, toByteArray, genRandomBytes } from 'anoma-client';
import config from '../config.json';

import universalKeyPair from '../keys/universalKeyPair.bin';
import universalVerifyingKey from '../keys/universalVerifyingKey.bin';
import kudosCreate from '../nockma/Create.nockma';
import logic from '../nockma/Logic.proved.nockma';

const grpcServer = `http://${config.proxyHost}:${config.proxyPort}`
const anomaClient = new AnomaClient(grpcServer);

async function createKudos(ownerId, quantity) {
  // keyPair == signing key + verifying key concatenated
  console.log(universalKeyPair);
  const uniKeyPairPayload = await fetchBinary(universalKeyPair);

  const uniVerifyingKeyPayload = await fetchBinary(universalVerifyingKey);
  const keyPairByteArray = toByteArray(uniKeyPairPayload);
  const verifyingKeyByteArray = toByteArray(uniVerifyingKeyPayload);

  const logicProgram = await fetchBinary(logic);
  const randomBytes = genRandomBytes(32);

  const encoder = new TextEncoder('utf-8');
  const encodedOwnerIdString = encoder.encode(ownerId);

  const kudosCreateProgram = await fetchBinary(kudosCreate);

  /**
   * TODO: The gRPC prove call expects all arguments to be jammed (i.e nock
   * serialized). However some arguments are already jammed, and these should
   * not be double jammed.
   *
   * You must call `serialize` on all unjammed arguments.
   *
   * A better solution would be to use a builder pattern to construct the
   * arguments to prove:
   *
   * builder = new ArgsBuilder();
   * builder.byteArray(keyPairByteArray);
   * builder.program(logicProgram);
   * args = builder.build();
   * anomaClient.prove(args);
   *
   * each method (e.g byteArray) knows whether to jam / serialize the argument.
   * In this case the `program` method would not serialize, but `byteArray`
   * would serialize.
   *
   * You can see which method to use from the makefile `juvix dev anoma prove` invocation.
   *
   * https://github.com/anoma/anoma-apps/blob/fb93dabe868118429d743011050f0544be9d2907/Kudos/makefile#L267-L275
   *
   * e.g 'bytearray:' prefix means 'call byteArray method etc.'. Whether each
   * prefix represents jammed or unjammed data is documented in
   *
   * `juvix dev anoma prove --help`.
   *
   */

  const tx = await anomaClient.prove(kudosCreateProgram, [serialize(keyPairByteArray), serialize(verifyingKeyByteArray), serialize(randomBytes), logicProgram, serialize(quantity), serialize(encodedOwnerIdString)]);
  return await anomaClient.addTransaction(tx);
}

async function getMessages() {
  const kind = await fetchBinary(appIdentity);
  const unspent = await anomaClient.filterKind(kind);
  if (unspent.length == 0) {
    throw Error("There are no stored messages");
  }
  const getMessageProgram = await fetchBinary(getMessage);
  let messages = [];
  for (const m of unspent) {
    const result = await anomaClient.prove(getMessageProgram, [m]);
    messages.push(deserializeToString(result));
  }
  return messages;
}

const button = document.getElementById('get-message');
const sendButton = document.getElementById('send-message');
const responseContainer = document.getElementById('response-container');
const input = document.getElementById("message-input");

const createKudosButton = document.getElementById('create-kudos');
const quantityInput = document.getElementById("kudos-quantity-input");
const ownerIdInput = document.getElementById("kudos-ownerId-input");

createKudosButton.addEventListener('click', async () => {
  createKudosButton.disabled = true;
  createKudosButton.textContent = "Loading..."
  // const quantity = quantityInput.value;

  try {
    // if (!quantity.trim()) {
    //   throw Error("Please enter a message")
    // }
    await createKudos("alice", 2);
  // }
  // catch (error) {
  //   responseContainer.innerHTML = `<p style="color: red;">${error}</p>`;
  } finally {
    createKudosButton.disabled = false;
    createKudosButton.textContent = "Create Kudos";
  }
});
