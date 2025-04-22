import { AnomaClient, deserializeToString, fetchBinary, genRandomBytes, ProveArgsBuilder } from 'anoma-client';
import config from '../config.json';

import kudosCreate from '../nockma/Create.nockma';
import logic from '../nockma/Logic.proved.nockma';

import getBalance from '../nockma/GetBalance.nockma';

import { Keypair } from "./keys";
import { Store } from "./storage";

const LOCALSTORAGE_PREFIX = "kudos-localstorage";
const KEYSTORE_KEY = "kudos-keystore";
const store = new Store(KEYSTORE_KEY, LOCALSTORAGE_PREFIX);

const grpcServer = `http://${config.proxyHost}:${config.proxyPort}`
const anomaClient = new AnomaClient(grpcServer);

async function createKudos(ownerId, quantity) {
  const keyRecord = await store.get(ownerId)
  let keyInstance;
  if (!keyRecord) {
    keyInstance = await Keypair.genEd25519Keypair(ownerId);
    await store.add(ownerId, keyInstance.values);
  } else {
    keyInstance = Keypair.fromStoredKeypair(keyRecord);
  }

  const privateKey = keyInstance.privateKey.bytes
  const publicKey = keyInstance.publicKey.bytes

  const proveArgs = new ProveArgsBuilder()
    .bytearray(new Uint8Array([...privateKey, ...publicKey]))
    .bytearray(publicKey)
    .bytesUnjammed(genRandomBytes(32))
    .bytes(await fetchBinary(logic))
    .nat(quantity)
    .string(ownerId)
    .build();
  const txResult = await anomaClient.prove(await fetchBinary(kudosCreate), proveArgs);
  return await anomaClient.addTransaction(txResult.data);
}

async function getBalances(ownerId) {
  const keyRecord = await store.get(ownerId)
  let keyInstance;
  if (!keyRecord) {
    throw Error("There are no keys associated with ownerId")
  } else {
    keyInstance = Keypair.fromStoredKeypair(keyRecord);
  }

  // TODO: Additionally filter by Kudos Kind, i.e. replace [] by [kind]
  const rawBalances = await anomaClient.filter([], [keyInstance.publicKey.bytes]);
  if (rawBalances.length == 0) {
    throw Error("There are no stored balances");
  }
  const getBalancesProgram = await fetchBinary(getBalance);
  const proveArgs = new ProveArgsBuilder()
    .list(rawBalances)
    .build();
  const txResult = await anomaClient.prove(getBalancesProgram, proveArgs);
  return txResult.data;
}

// const keyAliasInput = document.getElementById("key-alias");
// const keygenButton = document.getElementById("gen-keypair");

const responseContainer = document.getElementById('response-container');
const createKudosButton = document.getElementById('create-kudos');
const getBalanceButton = document.getElementById("get-balance");
const ownerIdInput = document.getElementById("owner-id-input");
const quantityInput = document.getElementById("quantity-input");
const balanceOwnerInput = document.getElementById("balance-owner-input");

// keygenButton.addEventListener("click", async () => {
//   const alias = keyAliasInput.value.trim();
//   if (alias === "") {
//     setError("Alias was not provided!");
//     return;
//   }

//   if (await store.get(alias)) {
//     setError(`Keypair for ${alias} exists! Choose a different name.`);
//     return;
//   }

//   try {
//     setError("");

//     const keypair = await Keypair.genEd25519Keypair(alias);
//     await store.add(alias, keypair.values);
//     updateList(await getRecords(store));
//   } catch (e) {
//     setError(console.error(e));
//   }
// });

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
