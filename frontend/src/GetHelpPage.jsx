import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import './GetHelpPage.css';
import apiFetch from './api';

const HELP_TYPES = [
  { value: 'Senior Care Support', labelKey: 'options.helpTypes.seniorCare' },
  { value: 'Meal Assistance', labelKey: 'options.helpTypes.meal' },
  { value: 'Transportation Support', labelKey: 'options.helpTypes.transportation' },
  { value: 'Medical Assistance', labelKey: 'options.helpTypes.medical' },
  { value: 'Mental Health Support', labelKey: 'options.helpTypes.mentalHealth' },
  { value: 'Housing Support', labelKey: 'options.helpTypes.housing' },
  { value: 'Other', labelKey: 'options.helpTypes.other' },
];

function GetHelpPage() {
  const { t } = useTranslation();
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
      const res = await apiFetch(`/api/help-requests`, {
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
          <span className="eyebrow">{t('getHelp.eyebrow')}</span>
          <h1>{t('getHelp.heading')}</h1>
          <p>{t('getHelp.lead')}</p>
        </div>
        <div className="page-header-side">
          <a href="tel:5550000000">(555) 000-0000</a>
          <a href="mailto:info@volunteerconnect.ca">info@volunteerconnect.ca</a>
        </div>
      </header>

      <div className="overlap-card gethelp-card">
        {status === 'success' ? (
          <div className="gethelp-success">
            <h2>{t('getHelp.success.heading')}</h2>
            <p>{t('getHelp.success.text')}</p>
            <button className="btn btn-outline" onClick={() => setStatus(null)}>{t('getHelp.success.another')}</button>
          </div>
        ) : (
          <form className="form-underline" onSubmit={handleSubmit}>
            <div className="form-row">
              <div>
                <label htmlFor="firstName">{t('common.firstName')}</label>
                <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="lastName">{t('common.lastName')}</label>
                <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label htmlFor="email">{t('common.email')}</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="phone">{t('common.phone')}</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <label htmlFor="helpType">{t('getHelp.form.helpType')}</label>
            <select id="helpType" name="helpType" value={form.helpType} onChange={handleChange} required>
              <option value="">{t('getHelp.form.chooseOne')}</option>
              {HELP_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{t(type.labelKey)}</option>
              ))}
            </select>
            <label htmlFor="description">{t('getHelp.form.tellUsMore')}</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={5} />
            {status === 'error' && (
              <p className="form-error">{t('common.genericError')}</p>
            )}
            <button className="btn btn-primary btn-lg" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? t('getHelp.form.sending') : t('getHelp.form.send')}
            </button>
          </form>
        )}
      </div>

      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <span className="eyebrow">{t('getHelp.expect.eyebrow')}</span>
              <h2>{t('getHelp.expect.heading')}</h2>
            </div>
            <div className="split-body">
              <ul className="check-list">
                <li>{t('getHelp.expect.item1')}</li>
                <li>{t('getHelp.expect.item2')}</li>
                <li>{t('getHelp.expect.item3')}</li>
                <li>{t('getHelp.expect.item4')}</li>
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
