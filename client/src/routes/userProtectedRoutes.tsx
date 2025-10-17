import { RootState } from '@/redux/store';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode; 
}

const UserProtectedRoute: React.FC<Props> = ({ children }) => {
  const { volenteerData, isAuthenticated } = useSelector((state: RootState) => state.volenteer);
console.log("vvvvvvvvvvvvvvolenteering",volenteerData);// this is getting


  if (!volenteerData?.user?.user) {
    return <Navigate to="/user/login" replace />;
  }

  return <>{children}</>; 
};

export default UserProtectedRoute;
