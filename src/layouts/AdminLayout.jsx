import React from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../hooks/useAuth'

import { Outlet } from 'react-router-dom'


export default function AdminLayout() {
  const { user,  error } = useAuth({middleware: "auth" });

  console.log("AdminLayout Renderizado - Usuario:", user);
  return (
    <div>
      <Navbar/>
      <Outlet />
    </div>
  )
}
