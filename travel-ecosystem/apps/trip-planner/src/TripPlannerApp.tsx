import React, { PropsWithChildren } from 'react';
import { BrowserRouter, useInRouterContext } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ensureQueryClientPersistence, queryClient } from './lib/queryClient';

ensureQueryClientPersistence();

type TripPlannerAppProps = {
  basename?: string;
};

const RouterBoundary: React.FC<PropsWithChildren<{ basename?: string }>> = ({
  basename,
  children,
}) => {
  const inRouter = useInRouterContext();

  if (inRouter) {
    return <>{children}</>;
  }

  return (
    <BrowserRouter
      basename={basename ?? import.meta.env.BASE_URL}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {children}
    </BrowserRouter>
  );
};

export const TripPlannerApp: React.FC<TripPlannerAppProps> = ({ basename }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterBoundary basename={basename}>
        <App />
      </RouterBoundary>
    </QueryClientProvider>
  );
};

export default TripPlannerApp;
