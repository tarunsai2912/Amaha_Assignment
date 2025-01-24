import React from 'react';
import './Error.css'; 

export default function Error({message}) {
  return (
    <div className="error-page">
      <img
        alt="404 ERROR"
        className="error-image"
        src="https://static-00.iconduck.com/assets.00/9-404-error-illustration-2048x908-vp03fkyu.png"
      />
      <h1 className="error-message">{message|| "Sorry Page Not Found !"}</h1>
    </div>
  );
}