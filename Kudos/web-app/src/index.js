import { ProveArgsBuilder, AnomaClient, deserializeToString, fetchBinary, serialize, genRandomBytes } from 'anoma-client';
import config from '../config.json';

import universalKeyPair from '../keys/universalKeyPair.bin';
import universalVerifyingKey from '../keys/universalVerifyingKey.bin';
import kudosCreate from '../nockma/Create.nockma';
import logic from '../nockma/Logic.proved.nockma';

const grpcServer = `http://${config.proxyHost}:${config.proxyPort}`
const anomaClient = new AnomaClient(grpcServer);

async function createKudos(ownerId, quantity) {
  // keyPair == signing key + verifying key concatenated
  const uniKeyPairPayload = await fetchBinary(universalKeyPair);
  const uniVerifyingKeyPayload = await fetchBinary(universalVerifyingKey);

  const logicProgram = await fetchBinary(logic);
  const randomBytes = genRandomBytes(32);

  const kudosCreateProgram = await fetchBinary(kudosCreate);

  const proveArgs = new ProveArgsBuilder()
    .bytearray(uniKeyPairPayload)
    .bytearray(uniVerifyingKeyPayload)
    .bytesUnjammed(randomBytes)
    .bytes(logicProgram)
    .nat(quantity)
    .string(ownerId)
    .build();
  const tx = await anomaClient.prove(kudosCreateProgram, proveArgs);
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
