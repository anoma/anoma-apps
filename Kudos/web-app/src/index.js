import { AnomaClient, deserializeToString, fetchBinary, genRandomBytes, ProveArgsBuilder } from 'anoma-client';
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
  const txResult = await anomaClient.prove(await fetchBinary(kudosCreate), proveArgs);
  return await anomaClient.addTransaction(txResult.data);
}

const responseContainer = document.getElementById('response-container');
const createKudosButton = document.getElementById('create-kudos');
const getBalanceButton = document.getElementById("get-balance");
const ownerIdInput = document.getElementById("owner-id-input");
const quantityInput = document.getElementById("quantity-input");

createKudosButton.addEventListener('click', async () => {
  createKudosButton.disabled = true;
  createKudosButton.textContent = "Loading..."
  const ownerId = ownerIdInput.value;
  const quantity = quantityInput.value;

  try {
    if (!ownerId.trim()) {
      throw Error("Please enter an owner id")
    }
    if (!quantity.trim()) {
      throw Error("Please enter a quantity")
    }
    await createKudos(ownerId, quantity);
  }
  catch (error) {
    responseContainer.innerHTML = `<p style="color: red;">${error}</p>`;
  } finally {
    createKudosButton.disabled = false;
    createKudosButton.textContent = "Create Kudos";
  }
});
