import React from "react";

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

export default Button;