import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { user,error } = useAuth({middleware: 'middleware'})
  return (
    <div>
      <Navbar/>
    <Outlet />
   </div>
  
   
  )
}
