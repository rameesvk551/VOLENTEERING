import AllHosts from "../../components/admin/AllHosts"
import DashboardHeader from "../../components/admin/Layout/DashbordHeader"
import DashboardSideBar from "../../components/admin/Layout/DashbordSideBar"

const AdminAllHostPage = () => {
  return (
    <div>
    <DashboardHeader/>
    <div className="flex items-center justify-between w-full"> 
     <div className="w-[330px]">
      <DashboardSideBar active={3}/>
     </div>
     <AllHosts/>
    </div>
  </div>
  )
}

export default AdminAllHostPage