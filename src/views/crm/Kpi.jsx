
import ResumenDashboard from '../../components/crm/ResumenDashboard'
import ResumenMeta from '../../components/crm/ResumenMeta'



export default function Kpi() {
  return (
<> 
<div className=' grid grid-cols-1 gap-4'>


  <div className=' col-span-1'>
   <ResumenMeta />
<ResumenDashboard />
  </div>
</div>

    </>

  
  )
}
