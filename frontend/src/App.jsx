import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import RootLayout from './pages/layout.js';
import CustomerLayout from './pages/(customer)/layout.js';
import BusinessAdminLayout from './pages/(business-admin)/layout.js';
import SuperAdminLayout from './pages/(super-admin)/layout.js';

// Pages
import PublicLanding from './pages/page.js';
import Login from './pages/(auth)/login/page.js';

// Customer Pages
import CustomerDashboard from './pages/(customer)/dashboard/page.js';
import CustomerHistory from './pages/(customer)/history/page.js';
import CustomerProfile from './pages/(customer)/profile/page.js';
import CustomerCheckin from './pages/(customer)/checkin/page.js';

// Business Admin Pages
import BusinessDashboard from './pages/(business-admin)/dashboard/business/page.js';
import BusinessAnalytics from './pages/(business-admin)/dashboard/business/analytics/page.js';
import BusinessBranches from './pages/(business-admin)/dashboard/business/branches/page.js';
import BusinessCoupons from './pages/(business-admin)/dashboard/business/coupons/page.js';
import BusinessLoyalty from './pages/(business-admin)/dashboard/business/loyalty/page.js';
import BusinessRewards from './pages/(business-admin)/dashboard/business/rewards/page.js';

// Super Admin Pages
import SuperDashboard from './pages/(super-admin)/dashboard/super/page.js';
import SuperBusinesses from './pages/(super-admin)/dashboard/super/businesses/page.js';
import SuperFraud from './pages/(super-admin)/dashboard/super/fraud/page.js';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Layout */}
        <Route element={<RootLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<PublicLanding />} />
          <Route path="/login" element={<Login />} />

          {/* Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/history" element={<CustomerHistory />} />
            <Route path="/profile" element={<CustomerProfile />} />
            <Route path="/checkin" element={<CustomerCheckin />} />
          </Route>

          {/* Business Admin Routes */}
          <Route element={<BusinessAdminLayout />}>
            <Route path="/dashboard/business" element={<BusinessDashboard />} />
            <Route path="/dashboard/business/analytics" element={<BusinessAnalytics />} />
            <Route path="/dashboard/business/branches" element={<BusinessBranches />} />
            <Route path="/dashboard/business/coupons" element={<BusinessCoupons />} />
            <Route path="/dashboard/business/loyalty" element={<BusinessLoyalty />} />
            <Route path="/dashboard/business/rewards" element={<BusinessRewards />} />
          </Route>

          {/* Super Admin Routes */}
          <Route element={<SuperAdminLayout />}>
            <Route path="/dashboard/super" element={<SuperDashboard />} />
            <Route path="/dashboard/super/businesses" element={<SuperBusinesses />} />
            <Route path="/dashboard/super/fraud" element={<SuperFraud />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
