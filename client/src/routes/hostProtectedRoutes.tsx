import { RootState } from '@/redux/store';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode; 
}

const HostProtectedRoute: React.FC<Props> = ({ children }) => {
  const { hostData, loading, error } = useSelector((state: RootState) => state.host);
  
  if (!hostData?.host) {
    return <Navigate to="/host/login" replace />;
  }

  return <>{children}</>; 
};

export default HostProtectedRoute;
