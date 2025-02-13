
import { Route, Routes } from 'react-router-dom'

import AdminLayout from '../layouts/AdminLayout'
import GestionUsers from '../views/GestionUsers'


import AuthLyout from '../layouts/AuthLyout'
import Login from '../views/Login'

import DepartamentosPage from '../views/calidad/DepartamentosPage'
import ProcesosDepartamento from '../components/calidad/ProcesosDepartamento'
import Tareas from '../views/calidad/Tareas'
import Errores from '../views/calidad/Errores'
import DepartatamentosUpdate from '../views/calidad/DepartatamentosUpdate'



export default function Router() {
  return (
<Routes>
    {/* Ruta de Login */}
    <Route path="/" element={<Login />} />

{/* Rutas bajo AuthLayout */}
<Route path="/auth" element={<AuthLyout />}>
  <Route path="procesos" element={<DepartamentosPage/>} />
  <Route path="procesos/:departamentoId" element={<ProcesosDepartamento/>} />
 

</Route>


{/* Rutas bajo AdminLayout */}
<Route path="/admin" element={<AdminLayout />}>
  <Route path="users" element={<GestionUsers />} />
 <Route path="tareas" element={<Tareas />} />
  <Route path="errores" element={<Errores/>} />
  <Route path="departamentos" element={<DepartatamentosUpdate/>} />

</Route>


</Routes>
  )
}
