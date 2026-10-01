import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Pillars from './Pillars';
import HowItWorks from './HowItWorks';
import ScrollToTop from './ScrollToTop';
import RecentOpportunities from './RecentOpportunities';
import NewsSection from './NewsSection';
import VolunteerList from './VolunteerList';
import SignupForm from './SignupForm';
import SigninForm from './SigninForm';
import Dashboard from './Dashboard';
import Footer from './Footer';
import MissionPage from './MissionPage';
import AboutPage from './AboutPage';
import OurTeamPage from './OurTeamPage';
import OurHistoryPage from './OurHistory';
import AdminDashboard from './AdminDashboard';
import OurWorkPage from './OurWorkPage';
import GetHelpPage from './GetHelpPage';
import VolunteerDetail from './VolunteerDetail';
import OrgDashboard from './OrgDashboard';
import OrganizationPage from './OrganizationPage';
import { getSessionRole } from './auth/session';

function PrivateRoute({ children }) {
  const role = getSessionRole();
  if (!role) return <Navigate to="/signin" />;
  if (role === 'organization') return <Navigate to="/org-dashboard" />;
  if (role === 'admin') return <Navigate to="/admin" />;
  return children;
}

function AdminRoute({ children }) {
  const role = getSessionRole();
  if (!role) return <Navigate to="/signin" />;
  return role === 'admin' ? children : <Navigate to="/dashboard" />;
}

function OrgRoute({ children }) {
  const role = getSessionRole();
  if (!role) return <Navigate to="/signin" />;
  return role === 'organization' ? children : <Navigate to="/dashboard" />;
}

function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Pillars />
      <RecentOpportunities />
      <NewsSection />
      <Footer />
    </div>
  );
}

function VolunteerPage() {
  return (
    <div>
      <Navbar />
      <VolunteerList />
      <Footer />
    </div>
  );
}

function VolunteerDetailPage() {
  return <VolunteerDetail />;
}

function SignupPage() {
  return (
    <div>
      <Navbar />
      <SignupForm />
      <Footer />
    </div>
  );
}

function SigninPage() {
  return (
    <div>
      <Navbar />
      <SigninForm />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/volunteer/:id" element={<VolunteerDetailPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/mission" element={<MissionPage />} />
        <Route path="/about/team" element={<OurTeamPage />} />
        <Route path="/about/history" element={<OurHistoryPage />} />
        <Route path="/our-work" element={<OurWorkPage />} />
        <Route path="/get-help" element={<GetHelpPage />} />
        <Route path="/organizations/:id" element={<OrganizationPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/org-dashboard"
          element={
            <OrgRoute>
              <OrgDashboard />
            </OrgRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
