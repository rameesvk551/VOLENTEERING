import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {UserLoginPage, UserSignupPage} from './routes/userRoutes';
import { HostLoginPage, HostSignupPage } from './routes/hostRoutes';
import { BlogDetails, BlogListPage, HomePage, HostDetailsPage, HostListPage } from './routes/publicRoutes';
import { AdminAllHostPage, AdminAllVolenteersPage, AdminDashbordPage, CreateBlog } from './routes/adminRoutes';
import AdminLoginPage from './pages/admin/AdminLoginPage';

const App = () => {
  return (
 <>
 <BrowserRouter>
      <Routes>
 
        <Route path="/user/signup" element={<UserSignupPage />} />
        <Route path="/host/signup" element={<HostSignupPage/>} />
        <Route path="/user/login" element={<UserLoginPage />} />
        <Route path="/host/login" element={<HostLoginPage/>} />
     {/**public routes */}
        <Route path="/" element={<HomePage/>} />
        <Route path="/blogs" element={<BlogListPage/>} />
        <Route path="/blog/:id" element={<BlogDetails/>} />
        <Route path="/oppertunities" element={<HostListPage/>} />
        <Route path="/oppertunities/:id" element={<HostDetailsPage/>} />


        {/**admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage/>} />
        <Route path="/admin/dashboard" element={<AdminDashbordPage/>} />
        <Route path="/admin/dashboard/all-volenteers" element={<AdminAllVolenteersPage/>} />
        <Route path="/admin/dashboard/all-hosts" element={<AdminAllHostPage/>} />


        {/**blog routes */}
        <Route path="/admin/dashboard/create-blog" element={<CreateBlog/>} />
        <Route path="/admin/dashboard" element={<AdminDashbordPage/>} />

      </Routes>
    </BrowserRouter>
 </>
  )
}

export default App
