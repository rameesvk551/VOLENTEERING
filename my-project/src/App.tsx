import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {UserLoginPage, UserSignupPage} from './routes/userRoutes';
import { HostLoginPage, HostSignupPage } from './routes/hostRoutes';

const App = () => {
  return (
 <>
 <BrowserRouter>
      <Routes>
 
        <Route path="/user/signup" element={<UserSignupPage />} />
        <Route path="/host/signup" element={<HostSignupPage/>} />
        <Route path="/user/login" element={<UserLoginPage />} />
        <Route path="/host/login" element={<HostLoginPage/>} />
      </Routes>
    </BrowserRouter>
 </>
  )
}

export default App
