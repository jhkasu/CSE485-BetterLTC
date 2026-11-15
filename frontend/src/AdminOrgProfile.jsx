import React from 'react';
import { useTranslation } from 'react-i18next';
import ORG_CATEGORIES from './orgCategories';
import {
  ENGAGEMENT_INTERESTS, GEOGRAPHIC_SCOPES, ORG_TYPES, POPULATIONS, REVIEW_FREQUENCIES, SERVICE_LANGUAGES, UPDATE_CONTACTS, labelFor,
} from './orgProfileOptions';

function AdminOrgProfile({ org }) {
  const { t, i18n } = useTranslation();
  const notSet = t('adminDashboard.organizations.notSet');

  const single = (list, value, other) => {
    if (!value) return '';
    return value === 'Other' && other ? `${labelFor(list, value, t)}: ${other}` : labelFor(list, value, t);
  };
  const many = (list, values, other) => (values || [])
    .map(value => (value === 'Other' && other ? `${labelFor(list, value, t)}: ${other}` : labelFor(list, value, t)))
    .join(', ');
  const address = [org.streetAddress, org.city, org.province, org.postalCode].filter(Boolean).join(', ');
  const socials = [
    ['Facebook', org.facebook],
    ['Instagram', org.instagram],
    ['LinkedIn', org.linkedIn],
    ['YouTube', org.youTube],
    ['TikTok', org.tikTok],
    [t('orgForm.socialOther'), org.otherSocial],
  ].filter(([, url]) => url);
  const updateContact = org.updateContact && org.updateContactDetails
    ? `${single(UPDATE_CONTACTS, org.updateContact)}: ${org.updateContactDetails}`
    : single(UPDATE_CONTACTS, org.updateContact);
  const consentDate = org.consentedAt
    ? new Date(org.consentedAt).toLocaleDateString(i18n.resolvedLanguage || i18n.language || 'en', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const sections = [
    ['orgForm.sections.identification', [
      ['orgForm.legalName', org.legalName],
      ['orgForm.publicName', org.orgName],
      ['orgForm.orgType', single(ORG_TYPES, org.orgType, org.orgTypeOther)],
      ['orgForm.yearEstablished', org.yearEstablished ? String(org.yearEstablished) : ''],
      ['orgForm.registration', org.registryNumber ? `${org.registryType}: ${org.registryNumber}` : ''],
      ['orgForm.geoScope', many(GEOGRAPHIC_SCOPES, org.geographicScope)],
      ['orgDashboard.profile.serviceAreas', (org.serviceAreas || []).map(city => (city === 'Other' ? t('volunteer.otherCity') : city)).join(', ')],
      ['orgForm.communitiesServed', org.communitiesServed],
      ['orgForm.address', address],
      ['orgForm.hideStreetAddress', org.hideStreetAddress ? t('adminDashboard.organizations.yes') : t('adminDashboard.organizations.no')],
      ['orgForm.additionalLocations', org.additionalLocations],
      ['orgDashboard.profile.website', org.website],
    ]],
    ['orgForm.sections.about', [
      ['orgForm.tagline', org.tagline],
      ['orgForm.shortDescription', org.shortDescription],
      ['orgForm.fullDescription', org.description],
      ['orgForm.mission', org.mission],
      ['orgForm.vision', org.vision],
      ['orgForm.values', org.coreValues],
      ['orgForm.story', org.story],
      ['orgForm.unique', org.uniqueness],
      ['orgForm.goals', org.goals],
    ]],
    ['orgForm.sections.focus', [
      ['orgForm.focusAreas', many(ORG_CATEGORIES, org.categories, org.categoryOther)],
      ['orgForm.populations', many(POPULATIONS, org.populationsServed, org.populationOther)],
      ['orgForm.languages', many(SERVICE_LANGUAGES, org.serviceLanguages, org.serviceLanguageOther)],
      ['orgForm.languageServices', org.languageServices],
      ['orgDashboard.profile.intergenerational', org.offersIntergenerational ? t('adminDashboard.organizations.yes') : t('adminDashboard.organizations.no')],
    ]],
    ['orgForm.sections.admin', [
      ['orgForm.submitter', org.contactName],
      ['orgForm.position', org.contactPosition],
      ['orgForm.adminEmail', org.email],
      ['orgForm.adminPhone', org.contactPhone],
      ['orgDashboard.profile.notificationEmail', org.notificationEmail],
      ['orgForm.updateContact', updateContact],
      ['orgForm.reviewFrequency', single(REVIEW_FREQUENCIES, org.reviewFrequency)],
      ['orgForm.engagement', many(ENGAGEMENT_INTERESTS, org.engagementInterests)],
      ['orgForm.comments', org.adminComments],
    ]],
    ['orgForm.sections.consent', [
      ['orgForm.representative', org.representativeName],
      ['adminDashboard.organizations.consentedOn', consentDate],
    ]],
  ];

  return (
    <div className="admin-org-profile">
      {!org.consentedAt && <p className="admin-org-profile-note">{t('adminDashboard.organizations.profileIncomplete')}</p>}
      {sections.map(([titleKey, rows]) => (
        <section key={titleKey} className="admin-org-profile-section">
          <h4>{t(titleKey)}</h4>
          <dl>
            {rows.map(([labelKey, value]) => (
              <div key={labelKey} className="admin-org-profile-row">
                <dt>{t(labelKey)}</dt>
                <dd className={value ? undefined : 'admin-org-profile-empty'}>{value || notSet}</dd>
              </div>
            ))}
            {titleKey === 'orgForm.sections.identification' && (
              <div className="admin-org-profile-row">
                <dt>{t('orgForm.social')}</dt>
                <dd className={socials.length ? undefined : 'admin-org-profile-empty'}>
                  {socials.length ? socials.map(([name, url]) => <div key={name}>{name}: {url}</div>) : notSet}
                </dd>
              </div>
            )}
          </dl>
        </section>
      ))}
    </div>
  );
}

export default AdminOrgProfile;
