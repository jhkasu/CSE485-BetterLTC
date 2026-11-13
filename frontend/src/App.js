import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Pillars from './Pillars';
import HowItWorks from './HowItWorks';
import ScrollToTop from './ScrollToTop';
import PageViewTracker from './PageViewTracker';
import NewsSection from './NewsSection';
import SignupForm from './SignupForm';
import SigninForm from './SigninForm';
import ForgotPasswordPage from './ForgotPasswordPage';
import ResetPasswordPage from './ResetPasswordPage';
import VerifyEmailPage from './VerifyEmailPage';
import Dashboard from './Dashboard';
import Footer from './Footer';
import MissionPage from './MissionPage';
import AboutPage from './AboutPage';
import OurTeamPage from './OurTeamPage';
import OurHistoryPage from './OurHistory';
import AdminDashboard from './AdminDashboard';
import OurWorkPage from './OurWorkPage';
import OrgDashboard from './OrgDashboard';
import OrganizationPage from './OrganizationPage';
import DirectoryPage from './DirectoryPage';
import FindYourFit from './FindYourFit';
import ResourcesPage from './ResourcesPage';
import FaqPage from './FaqPage';
import IntergenerationalPage from './IntergenerationalPage';
import IntergenerationalTeaser from './IntergenerationalTeaser';
import TestimonialsSection from './TestimonialsSection';
import { getSessionRole } from './auth/session';
import { useTranslation } from 'react-i18next';
import usePageTitle from './usePageTitle';

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
  const { t } = useTranslation();
  const fitTeaser = {
    title: t('home.fitTeaser.title'),
    description: t('home.fitTeaser.description'),
    button: t('home.fitTeaser.button'),
  };
  usePageTitle('');
  return (
    <div>
      <Navbar />
      <Hero />
      <HowItWorks />
      <section className="fit-teaser" aria-labelledby="fit-teaser-title">
        <div className="container">
          <h2 id="fit-teaser-title">{fitTeaser.title}</h2>
          <p>{fitTeaser.description}</p>
          <Link className="btn btn-primary" to="/find-your-fit">{fitTeaser.button}</Link>
        </div>
      </section>
      <Pillars />
      <IntergenerationalTeaser />
      <TestimonialsSection />
      <NewsSection />
      <Footer />
    </div>
  );
}

function SignupPage() {
  const { t } = useTranslation();
  usePageTitle(t('nav.signUp'));
  return (
    <div>
      <Navbar />
      <SignupForm />
      <Footer />
    </div>
  );
}

function SigninPage() {
  const { t } = useTranslation();
  usePageTitle(t('nav.signIn'));
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
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-your-fit" element={<FindYourFit />} />
        <Route path="/fit" element={<Navigate to="/find-your-fit" replace />} />
        <Route path="/volunteer/*" element={<Navigate to="/organizations" replace />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/mission" element={<MissionPage />} />
        <Route path="/about/team" element={<OurTeamPage />} />
        <Route path="/about/history" element={<OurHistoryPage />} />
        <Route path="/our-work" element={<OurWorkPage />} />
        <Route path="/get-help" element={<Navigate to="/organizations" replace />} />
        <Route path="/organizations" element={<DirectoryPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/intergenerational" element={<IntergenerationalPage />} />
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
