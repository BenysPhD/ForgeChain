import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Agreements from './pages/Agreements';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Audit from './pages/Audit';
import KPI from './pages/KPI';
import AdminPage from './pages/Admin';

export default function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agreements" element={<Agreements />} />
        <Route path="/kpi" element={<KPI />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}
