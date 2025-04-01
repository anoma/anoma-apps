import { ProveArgsBuilder, AnomaClient, deserializeToString, fetchBinary, serialize, genRandomBytes } from 'anoma-client';
import config from '../config.json';

import universalKeyPair from '../keys/universalKeyPair.bin';
import universalVerifyingKey from '../keys/universalVerifyingKey.bin';
import kudosCreate from '../nockma/Create.nockma';
import logic from '../nockma/Logic.proved.nockma';

const grpcServer = `http://${config.proxyHost}:${config.proxyPort}`
const anomaClient = new AnomaClient(grpcServer);

async function createKudos(ownerId, quantity) {
  const proveArgs = new ProveArgsBuilder()
    .bytearray(await fetchBinary(universalKeyPair))
    .bytearray(await fetchBinary(universalVerifyingKey))
    .bytesUnjammed(genRandomBytes(32))
    .bytes(await fetchBinary(logic))
    .nat(quantity)
    .string(ownerId)
    .build();
  const tx = await anomaClient.prove(await fetchBinary(kudosCreate), proveArgs);
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

const responseContainer = document.getElementById('response-container');
const createKudosButton = document.getElementById('create-kudos');
const getBalanceButton = document.getElementById("get-balance")

createKudosButton.addEventListener('click', async () => {
  createKudosButton.disabled = true;
  createKudosButton.textContent = "Loading..."

  try {
    await createKudos("alice", 2);
  }
  catch (error) {
    responseContainer.innerHTML = `<p style="color: red;">${error}</p>`;
  } finally {
    createKudosButton.disabled = false;
    createKudosButton.textContent = "Create Kudos";
  }
});
