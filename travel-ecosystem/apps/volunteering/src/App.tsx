import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import VolunteeringRouter from './bootstrap';

const App: React.FC = () => (
  <BrowserRouter>
    <VolunteeringRouter />
  </BrowserRouter>
);

export default App;
