import { AnomaClient, deserializeToString, fetchBinary, genRandomBytes, ProveArgsBuilder } from 'anoma-client';
import config from '../config.json';

import universalKeyPair from '../keys/universalKeyPair.bin';
import universalVerifyingKey from '../keys/universalVerifyingKey.bin';
import kudosCreate from '../nockma/Create.nockma';
import logic from '../nockma/Logic.proved.nockma';

import getBalance from '../nockma/GetBalance.nockma';

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

async function getBalances(ownerId) {
  const pubKeyUrl = universalVerifyingKey;
  // Filter arguments are NOT jammed
  const pubKey = await fetchBinary(pubKeyUrl)
  const rawBalances = await anomaClient.filter([], [pubKey]);
  if (rawBalances.legth == 0) {
    throw Error("There are no stored balances");
  }
  const getBalancesProgram = await fetchBinary(getBalance);
  const proveArgs = new ProveArgsBuilder()
    .list(rawBalances)
    .string(ownerId)
    .build();
  const txResult = await anomaClient.prove(getBalancesProgram, proveArgs);
  return txResult.data;
}

const responseContainer = document.getElementById('response-container');
const createKudosButton = document.getElementById('create-kudos');
const getBalanceButton = document.getElementById("get-balance");
const ownerIdInput = document.getElementById("owner-id-input");
const quantityInput = document.getElementById("quantity-input");
const balanceOwnerInput = document.getElementById("balance-owner-input");

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
    await createKudos(ownerId, parseInt(quantity));
  }
  catch (error) {
    responseContainer.innerHTML = `<p style="color: red;">${error}</p>`;
  } finally {
    createKudosButton.disabled = false;
    createKudosButton.textContent = "Create Kudos";
  }
});

getBalanceButton.addEventListener('click', async () => {
  getBalanceButton.disabled = true;
  getBalanceButton.textContent = "Loading..."
  const ownerId = balanceOwnerInput.value;

  try {
    if (!ownerId.trim()) {
      throw Error("Please enter an owner")
    }
    let balances = await getBalances(ownerId);
    const p = document.createElement('p');
    const convertedBalance = deserializeToString(balances);
    // TODO: GetBalance should return a list of strings, instead of one string, could create getBalancesWebApp
    p.textContent = convertedBalance;
    responseContainer.innerHTML = '';
    responseContainer.appendChild(p);
  }
  catch (error) {
    responseContainer.innerHTML = `<p style="color: red;">${error}</p>`;
  } finally {
    getBalanceButton.disabled = false;
    getBalanceButton.textContent = "Get Balance";
  }
});
