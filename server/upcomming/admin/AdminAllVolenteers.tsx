import React from 'react'
import DashboardHeader from '../../components/admin/Layout/DashbordHeader'
import DashboardSideBar from '../../components/admin/Layout/DashbordSideBar'
import AllVolenteers from '../../components/admin/AllVolenteers'


const AdminAllVolenteersPage = () => {
  return (
    <div>
    <DashboardHeader/>
    <div className="flex items-center justify-between w-full"> 
     <div className="w-[330px]">
      <DashboardSideBar active={2}/>
     </div>
     <AllVolenteers/>
    </div>
  </div>
  )
}

export default AdminAllVolenteersPage