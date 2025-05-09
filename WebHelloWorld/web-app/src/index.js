import { AnomaClient, fetchBinary, serialize, deserializeToString } from 'anoma-client';
import webHelloWorld from '../nockma/WebHelloWorld.nockma';
import getMessage from '../nockma/GetMessage.nockma'
import logic from '../nockma/Logic.proved.nockma'
import appIdentity from '../nockma/AppIdentity.cued.nockma'
import config from '../config.json'

const grpcServer = `http://${config.proxyHost}:${config.proxyPort}`
const anomaClient = new AnomaClient(grpcServer);

async function addMessage(message) {
  const logicProgram = await fetchBinary(logic);
  const webHelloWorldProgram = await fetchBinary(webHelloWorld);
  const tx = await anomaClient.prove(webHelloWorldProgram, [logicProgram, serialize(message)]);
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

button.addEventListener('click', async () => {
  button.disabled = true;
  button.textContent = "Loading..."
  try {
    let messages = await getMessages();
    const list = document.createElement('ul');
    messages.sort();
    for (const m of messages) {
      const listItem = document.createElement('li');
      listItem.textContent = m;
      list.appendChild(listItem);
    }
    responseContainer.innerHTML = '';
    responseContainer.appendChild(list);
  } catch (error) {
    responseContainer.innerHTML = `<p style="color: red;">${error}</p>`;
  } finally {
    button.disabled = false;
    button.textContent = "Get Messages";
  }
});

sendButton.addEventListener('click', async () => {
  sendButton.disabled = true;
  sendButton.textContent = "Loading..."
  const message = input.value;

  try {
    if (!message.trim()) {
      throw Error("Please enter a message")
    }
    await addMessage(message.trim());
  } catch (error) {
    responseContainer.innerHTML = `<p style="color: red;">${error}</p>`;
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "Send Message";
  }
});
