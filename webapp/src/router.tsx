import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Manufacturer from './components/pages/Manufacturer';
import About from './components/pages/About';
import Insurance from './components/pages/Insurance';
import Doctor from './components/pages/Doctor';
import PBMContractInteraction from './components/pages/PBMContractInteraction';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/manufacturer',
        element: <Manufacturer />,
      },
      {
        path: '/insurance',
        element: <Insurance />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/contract',
        element: <PBMContractInteraction />,
      },
    ],
  },
]); 