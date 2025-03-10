import React from "react";

import Button from "./Components/Button.js";
//The Global parent component
const App = () => {
  //Function to test click event
  function click() {
    alert("Click");
  }
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
    </div>
  );
};
export default App;