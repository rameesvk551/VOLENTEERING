import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {UserSignupPage} from './routes/userRoutes';
import { HostSignupPage } from './routes/hostRoutes';

const App = () => {
  return (
 <>
 <BrowserRouter>
      <Routes>
 
        <Route path="/user/signup" element={<UserSignupPage />} />
        <Route path="/host/signup" element={<HostSignupPage/>} />
      </Routes>
    </BrowserRouter>
 </>
  )
}

export default App
