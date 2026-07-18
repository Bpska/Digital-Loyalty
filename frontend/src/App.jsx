import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Loader from './components/Loader';

// ── Layouts (eagerly loaded — shared shell for all child pages) ───
import RootLayout from './pages/layout.js';

// Lazy-load all layouts and pages to enable route-level code splitting.
// Each lazy() call becomes a separate JS chunk only downloaded when visited.

// ── Auth & Public ────────────────────────────────────────────────
const CustomerLayout     = React.lazy(() => import('./pages/(customer)/layout.js'));
const BusinessAdminLayout = React.lazy(() => import('./pages/(business-admin)/layout.js'));
const SuperAdminLayout   = React.lazy(() => import('./pages/(super-admin)/layout.js'));

const PublicLanding      = React.lazy(() => import('./pages/page.js'));
const Login              = React.lazy(() => import('./pages/(auth)/login/page.jsx'));
const VerifyEmail        = React.lazy(() => import('./pages/(auth)/verify-email/page.js'));
const ForgotPassword     = React.lazy(() => import('./pages/(auth)/forgot-password/page.js'));
const RegisterBusiness   = React.lazy(() => import('./pages/(auth)/register-business/page.jsx'));
const PrivacyPolicy      = React.lazy(() => import('./pages/privacy-policy.js'));
const TermsOfService     = React.lazy(() => import('./pages/terms-of-service.js'));

// ── Customer Pages ───────────────────────────────────────────────
const CustomerDashboard      = React.lazy(() => import('./pages/(customer)/dashboard/page.js'));
const CustomerHistory        = React.lazy(() => import('./pages/(customer)/history/page.js'));
const CustomerProfile        = React.lazy(() => import('./pages/(customer)/profile/page.js'));
const CustomerCheckin        = React.lazy(() => import('./pages/(customer)/checkin/page.js'));
const CustomerLoyaltyHistory = React.lazy(() => import('./pages/(customer)/loyalty-history/page.js'));
const CustomerReview         = React.lazy(() => import('./pages/(customer)/review/page.js'));

// ── Business Admin Pages ─────────────────────────────────────────
const BusinessDashboard             = React.lazy(() => import('./pages/(business-admin)/dashboard/business/page.js'));
const BusinessAnalytics             = React.lazy(() => import('./pages/(business-admin)/dashboard/business/analytics/page.js'));
const BusinessBranches              = React.lazy(() => import('./pages/(business-admin)/dashboard/business/branches/page.js'));
const BusinessCoupons               = React.lazy(() => import('./pages/(business-admin)/dashboard/business/coupons/page.js'));
const BusinessLoyalty               = React.lazy(() => import('./pages/(business-admin)/dashboard/business/loyalty/page.js'));
const BusinessRewards               = React.lazy(() => import('./pages/(business-admin)/dashboard/business/rewards/page.js'));
const BusinessCheckins              = React.lazy(() => import('./pages/(business-admin)/dashboard/business/checkins/page.js'));
const BusinessApprovals             = React.lazy(() => import('./pages/(business-admin)/dashboard/business/approvals/page.js'));
const BusinessLoyaltyConfig         = React.lazy(() => import('./pages/(business-admin)/dashboard/business/loyalty-config/page.js'));
const BusinessRedemptions           = React.lazy(() => import('./pages/(business-admin)/dashboard/business/redemptions/page.js'));
const BrandCustomizationPage        = React.lazy(() => import('./pages/(business-admin)/dashboard/business/branding/page.js'));
const BusinessProfile               = React.lazy(() => import('./pages/(business-admin)/dashboard/business/profile/page.jsx'));
const BusinessCustomerNotifications = React.lazy(() => import('./pages/(business-admin)/dashboard/business/notifications/page.js'));
const BusinessPosterDesigner        = React.lazy(() => import('./pages/(business-admin)/dashboard/business/posters/page.jsx'));

// ── Super Admin Pages ────────────────────────────────────────────
const SuperDashboard  = React.lazy(() => import('./pages/(super-admin)/dashboard/super/page.js'));
const SuperBusinesses = React.lazy(() => import('./pages/(super-admin)/dashboard/super/businesses/page.js'));
const SuperFraud      = React.lazy(() => import('./pages/(super-admin)/dashboard/super/fraud/page.js'));
const SuperSupport    = React.lazy(() => import('./pages/(super-admin)/dashboard/super/support/page.js'));
const SuperAds        = React.lazy(() => import('./pages/(super-admin)/dashboard/super/ads/page.js'));
const SuperPosterManager = React.lazy(() => import('./pages/(super-admin)/dashboard/super/posters/page.jsx'));

// ── Scroll to top on route change ───────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ── Redirect based on role ───────────────────────────────────────
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

// ── Loading fallback shown while a lazy chunk is downloading ─────
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Root Layout */}
          <Route element={<RootLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<LandingGuard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register-business" element={<RegisterBusiness />} />
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
              <Route path="/dashboard/business/redemptions" element={<BusinessRedemptions />} />
              <Route path="/dashboard/business/branding" element={<BrandCustomizationPage />} />
              <Route path="/dashboard/business/profile" element={<BusinessProfile />} />
              <Route path="/dashboard/business/notifications" element={<BusinessCustomerNotifications />} />
              <Route path="/dashboard/business/posters" element={<BusinessPosterDesigner />} />
            </Route>

            {/* Super Admin Routes */}
            <Route element={<SuperAdminLayout />}>
              <Route path="/dashboard/super" element={<SuperDashboard />} />
              <Route path="/dashboard/super/businesses" element={<SuperBusinesses />} />
              <Route path="/dashboard/super/fraud" element={<SuperFraud />} />
              <Route path="/dashboard/super/support" element={<SuperSupport />} />
              <Route path="/dashboard/super/ads" element={<SuperAds />} />
              <Route path="/dashboard/super/posters" element={<SuperPosterManager />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
