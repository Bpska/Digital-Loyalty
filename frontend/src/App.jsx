import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import RootLayout from './pages/layout.js';
import CustomerLayout from './pages/(customer)/layout.js';
import BusinessAdminLayout from './pages/(business-admin)/layout.js';
import SuperAdminLayout from './pages/(super-admin)/layout.js';

// Pages
import PublicLanding from './pages/page.js';
import Login from './pages/(auth)/login/page.js';
import PrivacyPolicy from './pages/privacy-policy.js';
import TermsOfService from './pages/terms-of-service.js';

// Customer Pages
import CustomerDashboard from './pages/(customer)/dashboard/page.js';
import CustomerHistory from './pages/(customer)/history/page.js';
import CustomerProfile from './pages/(customer)/profile/page.js';
import CustomerCheckin from './pages/(customer)/checkin/page.js';
import CustomerLoyaltyHistory from './pages/(customer)/loyalty-history/page.js';
import CustomerReview from './pages/(customer)/review/page.js';

// Business Admin Pages
import BusinessDashboard from './pages/(business-admin)/dashboard/business/page.js';
import BusinessAnalytics from './pages/(business-admin)/dashboard/business/analytics/page.js';
import BusinessBranches from './pages/(business-admin)/dashboard/business/branches/page.js';
import BusinessCoupons from './pages/(business-admin)/dashboard/business/coupons/page.js';
import BusinessLoyalty from './pages/(business-admin)/dashboard/business/loyalty/page.js';
import BusinessRewards from './pages/(business-admin)/dashboard/business/rewards/page.js';
import BusinessCheckins from './pages/(business-admin)/dashboard/business/checkins/page.js';
import BusinessApprovals from './pages/(business-admin)/dashboard/business/approvals/page.js';
import BusinessLoyaltyConfig from './pages/(business-admin)/dashboard/business/loyalty-config/page.js';

// Super Admin Pages
import SuperDashboard from './pages/(super-admin)/dashboard/super/page.js';
import SuperBusinesses from './pages/(super-admin)/dashboard/super/businesses/page.js';
import SuperFraud from './pages/(super-admin)/dashboard/super/fraud/page.js';
import SuperSupport from './pages/(super-admin)/dashboard/super/support/page.js';

function LandingGuard() {
  const user = useAuthStore((state) => state.user);

  if (user) {
    if (user.role === 'SUPER_ADMIN') {
      return <Navigate to="/dashboard/super" replace />;
    } else if (user.role === 'BUSINESS_ADMIN') {
      return <Navigate to="/dashboard/business" replace />;
    } else {
      if (typeof window !== 'undefined') {
        const pending = sessionStorage.getItem('pendingCheckin');
        if (pending) {
          try {
            const { businessId, branchId, token } = JSON.parse(pending);
            sessionStorage.removeItem('pendingCheckin');
            return <Navigate to={`/checkin?businessId=${businessId}&branchId=${branchId}&token=${token}`} replace />;
          } catch (e) {
            // Ignore
          }
        }
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <PublicLanding />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Layout */}
        <Route element={<RootLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<LandingGuard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/history" element={<CustomerHistory />} />
            <Route path="/profile" element={<CustomerProfile />} />
            <Route path="/checkin" element={<CustomerCheckin />} />
            <Route path="/loyalty-history" element={<CustomerLoyaltyHistory />} />
            <Route path="/review" element={<CustomerReview />} />
          </Route>

          {/* Business Admin Routes */}
          <Route element={<BusinessAdminLayout />}>
            <Route path="/dashboard/business" element={<BusinessDashboard />} />
            <Route path="/dashboard/business/analytics" element={<BusinessAnalytics />} />
            <Route path="/dashboard/business/branches" element={<BusinessBranches />} />
            <Route path="/dashboard/business/coupons" element={<BusinessCoupons />} />
            <Route path="/dashboard/business/loyalty" element={<BusinessLoyalty />} />
            <Route path="/dashboard/business/rewards" element={<BusinessRewards />} />
            <Route path="/dashboard/business/checkins" element={<BusinessCheckins />} />
            <Route path="/dashboard/business/approvals" element={<BusinessApprovals />} />
            <Route path="/dashboard/business/loyalty-config" element={<BusinessLoyaltyConfig />} />
          </Route>

          {/* Super Admin Routes */}
          <Route element={<SuperAdminLayout />}>
            <Route path="/dashboard/super" element={<SuperDashboard />} />
            <Route path="/dashboard/super/businesses" element={<SuperBusinesses />} />
            <Route path="/dashboard/super/fraud" element={<SuperFraud />} />
            <Route path="/dashboard/super/support" element={<SuperSupport />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
