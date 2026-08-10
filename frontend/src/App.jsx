import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from '@/components/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/i18n';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import BusinessLogin from '@/pages/BusinessLogin';
import GetStarted from '@/pages/GetStarted';
import AppLayout from '@/components/layout/AppLayout';
import PartnerLayout from '@/components/layout/PartnerLayout';
import PublicLayout from '@/components/layout/PublicLayout';
import Landing from '@/pages/Landing';
import Membership from '@/pages/Membership';
import BecomePartner from '@/pages/BecomePartner';
import Home from '@/pages/Home';
import Discounts from '@/pages/Discounts';
import RestaurantDetail from '@/pages/RestaurantDetail';
import Savings from '@/pages/Savings';
import Gifting from '@/pages/Gifting';
import Events from '@/pages/Events';
import StudentID from '@/pages/StudentID';
import PartnerDashboard from '@/pages/PartnerDashboard';
import PartnerProfile from '@/pages/PartnerProfile';
import PartnerDiscounts from '@/pages/PartnerDiscounts';
import PartnerScan from '@/pages/PartnerScan';
import VerifyStudent from '@/pages/VerifyStudent';

const AppRoutes = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-pastel-canvas">
        <div className="w-8 h-8 border-4 border-pastel-lavender border-t-navy rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/discounts" element={<Discounts />} />
        <Route path="/discounts/:id" element={<RestaurantDetail />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/become-partner" element={<BecomePartner />} />
      </Route>

      <Route element={<PublicLayout hideFooter />}>
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<Navigate to="/login" replace />} />
        <Route path="/business/login" element={<BusinessLogin />} />
        <Route path="/verify/:token" element={<VerifyStudent />} />
      </Route>

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/gifting" element={<Gifting />} />
          <Route path="/events" element={<Events />} />
          <Route path="/student-id" element={<StudentID />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/business/login" replace />} />}>
        <Route element={<PartnerLayout />}>
          <Route path="/partner-dashboard" element={<PartnerDashboard />} />
          <Route path="/partner-dashboard/profile" element={<PartnerProfile />} />
          <Route path="/partner-dashboard/discounts" element={<PartnerDiscounts />} />
          <Route path="/partner-dashboard/scan" element={<PartnerScan />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
        <Toaster />
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
