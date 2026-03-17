import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Pillars from './Pillars';
import VolunteerList from './VolunteerList';
import SignupForm from './SignupForm';
import SigninForm from './SigninForm';
import Dashboard from './Dashboard';

function PrivateRoute({ children }) {
  const user = localStorage.getItem('currentUser');
  return user ? children : <Navigate to="/signin" />;
}

function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Pillars />
    </div>
  );
}

function VolunteerPage() {
  return (
    <div>
      <Navbar />
      <VolunteerList />
    </div>
  );
}

function SignupPage() {
  return (
    <div>
      <Navbar />
      <SignupForm />
    </div>
  );
}

function SigninPage() {
  return (
    <div>
      <Navbar />
      <SigninForm />
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
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
