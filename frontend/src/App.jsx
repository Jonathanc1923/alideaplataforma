import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserWorkspace from './pages/UserWorkspace';
import Terms from './pages/Terms';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Homepage / Landing */}
        <Route path="/" element={<Landing />} />

        {/* Authentication (Clients & Master Admin PIN 2732) */}
        <Route path="/login" element={<Login />} />

        {/* Terms & Conditions */}
        <Route path="/terms" element={<Terms />} />

        {/* Exclusive Master Admin Dashboard (PIN 2732) */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Client Workspace (WhatsApp Bot + CRM de Ventas) */}
        <Route path="/workspace" element={<UserWorkspace />} />

        {/* Backward Compatibility Redirects */}
        <Route path="/sessions" element={<Navigate to="/workspace" replace />} />
        <Route path="/sessions/:id" element={<Navigate to="/workspace" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
