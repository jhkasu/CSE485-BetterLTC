import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import './GetHelpPage.css';
import apiFetch from './api';
import SK_CITIES from './saskatchewanCities';

const HELP_TYPES = [
  { value: 'Senior Care Support', labelKey: 'options.helpTypes.seniorCare' },
  { value: 'Meal Assistance', labelKey: 'options.helpTypes.meal' },
  { value: 'Transportation Support', labelKey: 'options.helpTypes.transportation' },
  { value: 'Medical Assistance', labelKey: 'options.helpTypes.medical' },
  { value: 'Mental Health Support', labelKey: 'options.helpTypes.mentalHealth' },
  { value: 'Housing Support', labelKey: 'options.helpTypes.housing' },
  { value: 'Other', labelKey: 'options.helpTypes.other' },
];

const CONTACT_METHODS = [
  { value: 'Phone', labelKey: 'getHelp.request.methods.phone' },
  { value: 'Email', labelKey: 'getHelp.request.methods.email' },
];

const EMPTY_FORM = {
  helpType: '',
  city: '',
  contactMethod: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  forFamilyMember: false,
  seniorName: '',
  consentGiven: false,
};

function GetHelpPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const next = type === 'checkbox' ? checked : name === 'phone' ? formatPhone(value) : value;
    setForm({ ...form, [name]: next });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.consentGiven) {
      setError('getHelp.request.consentRequired');
      return;
    }
    setStatus('loading');
    try {
      const res = await apiFetch(`/api/help-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          phone: form.contactMethod === 'Phone' ? form.phone : '',
          email: form.contactMethod === 'Email' ? form.email : '',
          seniorName: form.forFamilyMember ? form.seniorName : '',
        }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setForm(EMPTY_FORM);
    } catch {
      setStatus(null);
      setError('common.genericError');
    }
  };

  return (
    <div>
      <Navbar />

      <section className="request-help">
        <div className="request-help-inner">
          <div className="request-help-card">
            {status === 'success' ? (
              <div className="gethelp-success">
                <h2>{t('getHelp.success.heading')}</h2>
                <p>{t('getHelp.success.text')}</p>
                <button className="btn btn-outline" onClick={() => setStatus(null)}>{t('getHelp.success.another')}</button>
              </div>
            ) : (
              <>
                <h1 className="request-help-title">{t('getHelp.request.heading')}</h1>
                <p className="request-help-lead">{t('getHelp.request.lead')}</p>
                <form className="request-help-form" onSubmit={handleSubmit}>
                  <label htmlFor="helpType">{t('getHelp.request.helpType')} <span aria-hidden="true">*</span></label>
                  <select id="helpType" name="helpType" value={form.helpType} onChange={handleChange} required>
                    <option value="">{t('getHelp.request.selectHelpType')}</option>
                    {HELP_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{t(type.labelKey)}</option>
                    ))}
                  </select>

                  <label htmlFor="city">{t('getHelp.request.city')} <span aria-hidden="true">*</span></label>
                  <select id="city" name="city" value={form.city} onChange={handleChange} required>
                    <option value="">{t('getHelp.request.selectCity')}</option>
                    {SK_CITIES.map(city => (
                      <option key={city} value={city}>{city === 'Other' ? t('volunteer.otherCity') : city}</option>
                    ))}
                  </select>

                  <label htmlFor="contactMethod">{t('getHelp.request.contactMethod')} <span aria-hidden="true">*</span></label>
                  <select id="contactMethod" name="contactMethod" value={form.contactMethod} onChange={handleChange} required>
                    <option value="">{t('getHelp.request.selectContactMethod')}</option>
                    {CONTACT_METHODS.map(method => (
                      <option key={method.value} value={method.value}>{t(method.labelKey)}</option>
                    ))}
                  </select>

                  {form.contactMethod && (
                    <div className="request-help-contact">
                      <div className="request-help-row">
                        <div>
                          <label htmlFor="firstName">{t('common.firstName')} <span aria-hidden="true">*</span></label>
                          <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} autoComplete="given-name" required />
                        </div>
                        <div>
                          <label htmlFor="lastName">{t('common.lastName')} <span aria-hidden="true">*</span></label>
                          <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} autoComplete="family-name" required />
                        </div>
                      </div>
                      {form.contactMethod === 'Phone' ? (
                        <>
                          <label htmlFor="phone">{t('getHelp.request.phone')} <span aria-hidden="true">*</span></label>
                          <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} autoComplete="tel" pattern="\(\d{3}\) \d{3}-\d{4}" required />
                        </>
                      ) : (
                        <>
                          <label htmlFor="email">{t('getHelp.request.email')} <span aria-hidden="true">*</span></label>
                          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
                        </>
                      )}
                    </div>
                  )}

                  <label className="request-help-check">
                    <input type="checkbox" name="consentGiven" checked={form.consentGiven} onChange={handleChange} />
                    <span>{t('getHelp.request.consent')}</span>
                  </label>

                  <label className="request-help-check">
                    <input type="checkbox" name="forFamilyMember" checked={form.forFamilyMember} onChange={handleChange} />
                    <span>{t('getHelp.request.family')}</span>
                  </label>

                  {form.forFamilyMember && (
                    <>
                      <label htmlFor="seniorName">{t('getHelp.request.seniorName')} <span aria-hidden="true">*</span></label>
                      <input id="seniorName" name="seniorName" value={form.seniorName} onChange={handleChange} required />
                    </>
                  )}

                  {error && <p className="form-error request-help-error" role="alert">{t(error)}</p>}

                  <p className="request-help-note">{t('getHelp.request.requiredNote')}</p>
                  <button className="btn btn-primary btn-lg request-help-submit" type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? t('getHelp.form.sending') : t('getHelp.request.submit')}
                  </button>
                </form>
              </>
            )}
          </div>

          <figure className="request-help-photo">
            <img src="/care2.png" alt={t('getHelp.request.photoAlt')} />
            <figcaption>{t('getHelp.request.quote')}</figcaption>
          </figure>
        </div>
      </section>

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
