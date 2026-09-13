import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './GetHelpPage.css';
import API_BASE from './config';

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

      <header className="page-header page-header--plain gethelp-header">
        <div className="page-header-text">
          <span className="eyebrow">Get help</span>
          <h1>We are here to help</h1>
          <p>
            Need support with meals, rides, home visits, or care for an older adult?
            Tell us a little about your situation and a real person will call you back.
          </p>
        </div>
        <div className="page-header-side">
          <a href="tel:5550000000">(555) 000-0000</a>
          <a href="mailto:info@volunteerconnect.ca">info@volunteerconnect.ca</a>
        </div>
      </header>

      <div className="overlap-card gethelp-card">
        {status === 'success' ? (
          <div className="gethelp-success">
            <h2>Thank you for reaching out</h2>
            <p>We have received your request and will get back to you within two business days.</p>
            <button className="btn btn-outline" onClick={() => setStatus(null)}>Send another request</button>
          </div>
        ) : (
          <form className="form-underline" onSubmit={handleSubmit}>
            <div className="form-row">
              <div>
                <label htmlFor="firstName">First name</label>
                <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="lastName">Last name</label>
                <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <label htmlFor="helpType">How can we help?</label>
            <select id="helpType" name="helpType" value={form.helpType} onChange={handleChange} required>
              <option value="">Choose one</option>
              {HELP_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <label htmlFor="description">Tell us more</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={5} />
            {status === 'error' && (
              <p className="form-error">Something went wrong. Please try again.</p>
            )}
            <button className="btn btn-primary btn-lg" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send request'}
            </button>
          </form>
        )}
      </div>

      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <span className="eyebrow">What to expect</span>
              <h2>Simple, free, and local</h2>
            </div>
            <div className="split-body">
              <ul className="check-list">
                <li>A volunteer coordinator calls you back within two business days</li>
                <li>Every volunteer has passed a background check</li>
                <li>There is no cost to you or your family</li>
                <li>You can pause or stop the help at any time</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default GetHelpPage;
