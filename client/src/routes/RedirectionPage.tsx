import { RootState } from '@/redux/store';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

const RedirectRoute: React.FC<Props> = ({ children }) => {
  const { hostData, loading, error } = useSelector((state: RootState) => state.host);
  const { volenteerData, isAuthenticated } = useSelector((state: RootState) => state.volenteer);


  if (hostData?.host || isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RedirectRoute;
