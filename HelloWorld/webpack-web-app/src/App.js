import { AnomaClient, deserializeToString, fetchBinary, serialize } from "anoma-client";
import React, { useState } from "react";
import Button from "./Components/Button.js";

import appIdentity from '../nockma/AppIdentity.cued.nockma';
import getMessage from '../nockma/GetMessage.nockma';
import helloWorld from '../nockma/HelloWorld.nockma';
import logic from '../nockma/Logic.proved.nockma';

import config from '../config.json';

const grpcServer = `http://${config.proxyHost}:${config.proxyPort}`
const anomaClient = new AnomaClient(grpcServer);

async function addMessage() {
  // const logicProgram = await fetchBinary(logic);
  // const helloWorldProgram = await fetchBinary(helloWorld);
  // const tx = await anomaClient.prove(helloWorldProgram, [logicProgram, serialize("message")]);
  // return await anomaClient.addTransaction(tx);
  try {
    const logicProgram = await fetchBinary(logic);
    const helloWorldProgram = await fetchBinary(helloWorld);
    const serializedMessage = serialize("message123")
    const tx = await anomaClient.prove(helloWorldProgram, [logicProgram, serializedMessage]);
    await anomaClient.addTransaction(tx);
    console.log("Transaction added successfully");
  } catch (error) {
    console.error("Error adding message:", error);
  }
}

async function getMessages(setMessage) {
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
  return setMessage(messages);
}

//The Global parent component
const App = () => {
    //Function to test click event
  function click() {
    alert("Click");
  }

  const [message, setMessage] = useState('placeholder')

  return (
    <div className='container'>
      <h1>STEP 6: Separating files</h1>
      <ul>
        <li>Adding: /src/App.js</li>
        <li>Adding: /src/Components/Button/Button.js</li>
      </ul>
      <Button backgroundColor={"green"} onClick={click}>
        Click me!
      </Button>
    <div>
      <Button onClick={addMessage}>send message</Button>
      <Button onClick={() => getMessages(setMessage)}>get messages</Button>
      <p>{message}</p>
    </div>
    </div>
  );
};
export default App;