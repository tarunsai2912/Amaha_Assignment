 import React from 'react'
import { useNavigate } from 'react-router-dom'
 
 export default function UnAuthroizedPage() {
    const navigate=useNavigate()
   return (
<>
<div className="error-page">
      <img
        alt="404 ERROR2"
        className="error-image"
        src="https://static-00.iconduck.com/assets.00/9-404-error-illustration-2048x908-vp03fkyu.png"
      />
      <h1 className="error-message">Unauthroized Access !</h1>
      <button className="l_r_r_b1" style={{backgroundColor:"rgb(152 141 255)", cursor:"pointer"}} onClick={()=>{
        navigate("/")
      }}>Login</button> 
    </div>
</>
   )
 }
 