
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

export default function AuthLyout() {
  return (
   <div>
    <Navbar/>
    <Outlet/>
   </div>
  )
}
