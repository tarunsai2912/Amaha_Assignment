import React from 'react';
import './Loader.css'; 
import Portal from "../../Services/Portal"

const Loader2=()=>{
  return(
    <div className="loader8">
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
  </div>
  )
}
const Loader = () => {
  return (
<Portal close={"s"} component={<Loader2/>}/>
  );
};

export default Loader;