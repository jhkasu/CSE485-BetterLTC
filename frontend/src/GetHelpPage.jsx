import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './GetHelpPage.css';

const API_BASE = 'http://localhost:5184';

const HELP_TYPES = [
  'Senior Care Support',
  'Meal Assistance',
  'Transportation Support',
  'Medical Assistance',
  'Mental Health Support',
  'Housing Support',
  'Other',
];

function GetHelpPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    helpType: '',
    description: '',
  });
  const [status, setStatus] = useState(null);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'phone' ? formatPhone(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/help-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setForm({ firstName: '', lastName: '', email: '', phone: '', helpType: '', description: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div>
      <Navbar />

      <div className="gethelp-banner">
        <img src="/getHelp.jpg" alt="Get Help" />
        <div className="gethelp-banner-overlay">
          <h1 className="gethelp-banner-title">Get Help</h1>
        </div>
      </div>

      <div className="gethelp-intro">
        <h2 className="gethelp-intro-title">Here to <span className="script-accent">Help</span></h2>
        <p className="gethelp-intro-text">
          If you or someone you know needs support with senior care, meals, transportation,
          or any other life challenge, BetterLTC is here for you. Fill out the form below
          and our team will reach out as soon as possible.
        </p>
      </div>

      <div className="gethelp-body">
        <div className="gethelp-form-wrap">
          {status === 'success' ? (
            <div className="gethelp-success">
              <h3>Thank you for reaching out!</h3>
              <p>We have received your request and will get back to you soon.</p>
              <button className="gethelp-btn" onClick={() => setStatus(null)}>Submit another request</button>
            </div>
          ) : (
            <form className="gethelp-form" onSubmit={handleSubmit}>
              <div className="gethelp-row">
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
              />
              <select
                name="helpType"
                value={form.helpType}
                onChange={handleChange}
                required
              >
                <option value="">How can we help? (Required)</option>
                {HELP_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <textarea
                name="description"
                placeholder="Question or comment"
                value={form.description}
                onChange={handleChange}
                rows={6}
              />
              {status === 'error' && (
                <p className="gethelp-error">Something went wrong. Please try again.</p>
              )}
              <button className="gethelp-btn" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send'}
              </button>
            </form>
          )}
        </div>

        <div className="gethelp-image-wrap">
          <img src="/getHelpForm.png" alt="Get Help" />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default GetHelpPage;
