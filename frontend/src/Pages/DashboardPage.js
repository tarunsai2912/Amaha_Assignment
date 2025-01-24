import React from 'react'
import Dashboard from "../Components/Dashboard/DashboardMain"
import { useSelector } from 'react-redux'
import UnAuthroizedPage from './UnAuthroizedPage'
export default function DashboardPage() {
  const loggedInOrNot=useSelector((state)=>state.LoggedOrNot).loggedin
  return (
 <>


{loggedInOrNot?<Dashboard/>:<UnAuthroizedPage/>}
 </>
  )
}
