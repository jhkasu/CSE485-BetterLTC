import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Pillars from './Pillars';
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

function PrivateRoute({ children }) {
  const user = localStorage.getItem('currentUser');
  return user ? children : <Navigate to="/signin" />;
}

function AdminRoute({ children }) {
  const stored = localStorage.getItem('currentUser');
  if (!stored) return <Navigate to="/signin" />;
  const user = JSON.parse(stored);
  return user.role === 'admin' ? children : <Navigate to="/dashboard" />;
}

function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Pillars />
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/mission" element={<MissionPage />} />
        <Route path="/about/team" element={<OurTeamPage />} />
        <Route path="/about/history" element={<OurHistoryPage />} />
        <Route path="/our-work" element={<OurWorkPage />} />
        <Route path="/get-help" element={<GetHelpPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
