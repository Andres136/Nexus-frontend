
import GraficaClientes from '../../components/crm/GraficaClientes'
import ResumenDashboard from '../../components/crm/ResumenDashboard'



export default function Kpi() {
  return (
<> 
<div className=' grid grid-cols-1 gap-4'>

  <div className=' col-span-1'>
     <GraficaClientes />
<ResumenDashboard />
  </div>
</div>

    </>

  
  )
}
