import React, { useEffect } from 'react'
import DashboardHeader from '../../components/admin/Layout/DashbordHeader'
import DashboardSideBar from '../../components/admin/Layout/DashbordSideBar'
import DashboardHero from '../../components/admin/DashboardHero'
import { useDispatch } from 'react-redux'
import { loadAdmin } from '../../redux/adminSlice'
import { AppDispatch } from '../../redux/store'

const AdminDashbordPage = () => {
 const dispatch= useDispatch<AppDispatch>()
 useEffect(()=>{
  console.log("dispatcjging");
  
  dispatch(loadAdmin())
 },[])
  return (
    <div>
      <DashboardHeader/>
      <div className="flex items-center justify-between w-full"> 
       <div className="w-[330px]">
        <DashboardSideBar active={1}/>
       </div>
       <DashboardHero/>
      </div>
    </div>
  )
}

export default AdminDashbordPage
