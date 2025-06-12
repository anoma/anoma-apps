import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AnomaClient } from 'anoma-client'

function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)

  // const client = new AnomaClient("localhost:123")

  // useEffect(() =>
  //   client.listUnspentResources()
  //         .then((rs) => {
  //           setData(rs);
  //         })
  //         .catch((e) => {
  //           setError(e.message);
  //         })
  // , []);

  return (
    <div>
      {error ? (
        <div>Error: {error}</div>
      ) : data ? (
        <div>Data: {data}</div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default App
