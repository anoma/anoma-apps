import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import helloWorld from '../../anoma-build/HelloWorld.nockma?url';
import logic from '../../anoma-build/Logic.proved.nockma?url';

import { AnomaClient, fetchBinary, serialize } from 'anoma-client';

const anomaClient = new AnomaClient('localhost:9000');

async function addMessage(message: string) {
  const logicProgram = await fetchBinary(helloWorld);
  const helloWorldProgram = await fetchBinary(logic);
  const tx = await anomaClient.prove(helloWorldProgram, [logicProgram, serialize(message)]);
  return await anomaClient.addTransaction(tx);
}

const test = await addMessage('hello');

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <p>
          {test} {/* REMOVE */}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
