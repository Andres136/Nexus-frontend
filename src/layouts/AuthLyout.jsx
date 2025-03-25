
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthLyout() {
  const { user,error } = useAuth({middleware: 'middleware'})
  return (
   <div>
    <Navbar/>
    <Outlet/>
   </div>
  )
}
