
import Navbar from '../components/Navbar'


import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AdminLayout() {
  const { user,error } = useAuth({middleware: 'auth'})



  return (
    <div>
      <Navbar/>
      <Outlet />
    </div>
  )
}
