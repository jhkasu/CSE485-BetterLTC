import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MdPerson, MdAccountBalance, MdApartment, MdPhone,
  MdBusiness, MdVolunteerActivism, MdChevronRight,
} from 'react-icons/md';
import './HowItWorks.css';

const STEPS = [
  { key: 'request', icon: <MdPerson /> },
  { key: 'match', icon: <MdAccountBalance /> },
  { key: 'accept', icon: <MdApartment /> },
  { key: 'contact', icon: <MdPhone /> },
];

const ROLES = [
  { key: 'seniors', icon: <MdPerson />, link: '/get-help' },
  { key: 'organizations', icon: <MdBusiness />, link: '/signup' },
  { key: 'volunteers', icon: <MdVolunteerActivism />, link: '/organizations' },
];

function HowItWorks() {
  const { t } = useTranslation();
  return (
    <section className="section how-it-works" aria-labelledby="how-it-works-title">
      <div className="container">
        <h2 id="how-it-works-title" className="section-title how-title">{t('home.howItWorks.heading')}</h2>
        <p className="how-lead">{t('home.howItWorks.lead')}</p>

        <ol className="how-steps">
          {STEPS.map((step, i) => (
            <li key={step.key} className="how-step">
              <div className="how-step-icon" aria-hidden="true">{step.icon}</div>
              {i < STEPS.length - 1 && <MdChevronRight className="how-step-arrow" aria-hidden="true" />}
              <h3 className="how-step-title">
                <span className="how-step-number">{i + 1}.</span> {t(`home.howItWorks.steps.${step.key}.title`)}
              </h3>
              <p className="how-step-text">{t(`home.howItWorks.steps.${step.key}.text`)}</p>
            </li>
          ))}
        </ol>

        <p className="how-roles-heading">{t('home.howItWorks.rolesHeading')}</p>
        <ul className="how-roles">
          {ROLES.map(role => (
            <li key={role.key}>
              <Link className="how-role" to={role.link}>
                <span className={`how-role-icon how-role-icon--${role.key}`} aria-hidden="true">{role.icon}</span>
                <span>
                  <span className="how-role-title">{t(`home.howItWorks.roles.${role.key}.title`)}</span>
                  <span className="how-role-text">{t(`home.howItWorks.roles.${role.key}.text`)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default HowItWorks;
