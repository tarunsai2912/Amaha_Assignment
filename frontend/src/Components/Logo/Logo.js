import React from 'react'
import LogoPNG from "../../Assets/codesandbox.png"
import "./Logo.css"
export default function Logo() {
  return (
   <>
    <div className='logo_container'>
        <img alt='logo' className='logo_container_img' src={LogoPNG}/>
        <div className='logo_container_heading'>Kanban Board</div>
    </div>
   </>
  )
}
