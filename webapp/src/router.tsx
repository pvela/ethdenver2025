import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Manufacturer from './components/pages/Manufacturer';
import About from './components/pages/About';
import Insurance from './components/pages/Insurance';
import Doctor from './components/pages/Doctor';

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
        path: '/doctor',
        element: <Doctor />,
      },
      {
        path: '/about',
        element: <About />,
      },
    ],
  },
]); 