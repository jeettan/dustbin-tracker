import React from 'react';
import ReactDOM from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import "leaflet/dist/leaflet.css";

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './components/Main/App';
import AdminDashboard from './components/Admin/AdminDashboard'
import ProtectedRoutes from './ProtectedRoute';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>

);
