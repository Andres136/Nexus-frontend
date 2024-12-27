import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from '../layouts/Layout'
import AdminLayout from '../layouts/AdminLayout'
import GestionUsers from '../views/GestionUsers'
import GestionProcesos from '../views/calidad/GestionProcesos'

import AuthLyout from '../layouts/AuthLyout'
import Login from '../views/Login'
import EstrategicosGerencia from '../views/calidad/EstrategicosGerencia'



export default function Router() {
  return (
<Routes>
    {/* Ruta de Login */}
    <Route path="/" element={<Login />} />

{/* Rutas bajo AuthLayout */}
<Route path="/auth" element={<AuthLyout />}>
  <Route path="procesos" element={<GestionProcesos />} />
  <Route path=":macroproceso_id/:departmen_id" element={<EstrategicosGerencia/>} />
</Route>

{/* Rutas bajo AdminLayout */}
<Route path="/admin" element={<AdminLayout />}>
  <Route path="users" element={<GestionUsers />} />
</Route>

</Routes>
  )
}
