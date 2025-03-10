import React from "react";

import { render } from "react-dom";

const Button = ({ backgroundColor, children, onClick }) => {
  return (
    <button
      style={{ backgroundColor: backgroundColor, padding: "10px", border: "none" }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

//The Global parent component
const App = () => {
  //Function to test click event
  function click() {
    alert("Click");
  }
  return (
    <div className='container'>
      <h1>STEP 5: Using node packages</h1>
      <ul>
        <li>packages.json initialization</li>
        <li>Installing React, Babel and Webpack dependencies</li>
        <li>Move /public/index.js to /src/index.js</li>
      </ul>
      <Button backgroundColor={"green"} onClick={click}>
        Click me!
      </Button>
    </div>
  );
};

render(<App />, document.querySelector("#root")); //Render the App