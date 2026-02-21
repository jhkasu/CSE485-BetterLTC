import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Pillars from './Pillars';
import VolunteerList from './VolunteerList';
import SignupForm from './SignupForm';

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
