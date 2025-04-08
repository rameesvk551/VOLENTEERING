import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {UserLoginPage, UserProfilePage, UserSignupPage, VolenteerAddDetails} from './routes/userRoutes';
import { HostAddDetailsPage, HostLoginPage, HostPreviewPage, HostProfileEditPage, HostSignupPage } from './routes/hostRoutes';
import { BlogDetails, BlogListPage, HomePage, HostDetailsPage, HostListPage } from './routes/publicRoutes';
import { AdminAllHostPage, AdminAllVolenteersPage, AdminDashbordPage, CreateBlog } from './routes/adminRoutes';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import Messages from './pages/messagesPage/Messages';
import MemberShipPlanPage from './pages/user/MemberShipPlanPage';
import Navbar from './components/Navbar';
import PlanYourTrip from './pages/TravelPlanning/PlanYourTrip';
import HotelBookingPage from './pages/publicPages/HotelBookingPage';
import HotelBookingHomePage from './pages/publicPages/HotelBookingHomePage';
import FlightPage from './pages/publicPages/FlightPage';


const App = () => {
  return (
 <>

 <BrowserRouter>

      <Routes>
      <Route path="/search-hotels" element={<HotelBookingPage/>} />
     
      <Route path="/hotels" element={<HotelBookingHomePage/>} />
      <Route path="/flights" element={<FlightPage/>} />
     
      <Route path="/trip-planning" element={<PlanYourTrip/>} />
        <Route path="/host/signup" element={<HostSignupPage/>} />
         <Route path="/host/login" element={<HostLoginPage/>} />
         <Route path="/host/add-details/:id" element={<HostAddDetailsPage/>} />
         <Route path="/host/preview" element={<HostPreviewPage/>} />
         <Route path="/host/edit-profile" element={<HostProfileEditPage/>} />
     {/**public routes */}
     <Route path="/" element={<HomePage/>} />
     <Route path="/user/signup" element={<UserSignupPage />} />
     <Route path="/user/login" element={<UserLoginPage />} />
     <Route path="/user/membership" element={<MemberShipPlanPage />} />
        <Route path="/" element={<HomePage/>} />
        <Route path="/blogs" element={<BlogListPage/>} />
        <Route path="/blog/:id" element={<BlogDetails/>} />
        <Route path="/oppertunities" element={<HostListPage/>} />
        <Route path="/host-details/:id" element={<HostDetailsPage/>} />


        {/**admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage/>} />
        <Route path="/admin/dashboard" element={<AdminDashbordPage/>} />
        <Route path="/admin/dashboard/all-volenteers" element={<AdminAllVolenteersPage/>} />
        <Route path="/admin/dashboard/all-hosts" element={<AdminAllHostPage/>} />


        {/**blog routes */}
        <Route path="/admin/dashboard/create-blog" element={<CreateBlog/>} />
        <Route path="/admin/dashboard" element={<AdminDashbordPage/>} />

        {/** volenteer routes */}
        <Route path="/volenteer/add-details/:id" element={<VolenteerAddDetails/>} />
        <Route path="/volenteer/profile/:id" element={<UserProfilePage/>} />
     
   {/**message */}
   <Route path="/message" element={<Messages/>} />

      </Routes>
    </BrowserRouter>
 </>
  )
}

export default App
