function options(group, entries) {
  return entries.map(([value, key]) => ({ value, labelKey: `options.${group}.${key}` }));
}

export const ORG_TYPES = options('orgTypes', [
  ['Registered Charity', 'charity'],
  ['Incorporated Non-Profit Organization', 'nonprofit'],
  ['Community-Based Organization', 'community'],
  ['Indigenous-Led Organization', 'indigenous'],
  ['Grassroots or Volunteer-Led Initiative', 'grassroots'],
  ['Faith-Based Organization', 'faith'],
  ['Educational Institution', 'education'],
  ['Social Enterprise', 'socialEnterprise'],
  ['Public Institution or Agency', 'public'],
  ['Business with a Community Volunteer Program', 'business'],
  ['Other', 'other'],
]);

export const GEOGRAPHIC_SCOPES = options('geoScopes', [
  ['Local Community', 'local'],
  ['Municipal/Regional', 'regional'],
  ['Saskatchewan-Wide', 'provincial'],
  ['Western Canada', 'western'],
  ['National', 'national'],
  ['International', 'international'],
]);

export const POPULATIONS = options('populations', [
  ['Children', 'children'],
  ['Youth', 'youth'],
  ['Young Adults', 'youngAdults'],
  ['Adults', 'adults'],
  ['Seniors', 'seniors'],
  ['Families', 'families'],
  ['Care Partners/Caregivers', 'caregivers'],
  ['Individuals Living with Disabilities', 'disabilities'],
  ['Indigenous Peoples and Communities', 'indigenous'],
  ['Newcomers and Refugees', 'newcomers'],
  ['Individuals Experiencing Financial Hardship', 'financialHardship'],
  ['Rural or Remote Communities', 'rural'],
  ['General Public', 'generalPublic'],
  ['Other', 'other'],
]);

export const SERVICE_LANGUAGES = options('serviceLanguages', [
  ['French', 'french'],
  ['Cree', 'cree'],
  ['Dene', 'dene'],
  ['Michif', 'michif'],
  ['Tagalog', 'tagalog'],
  ['Other', 'other'],
]);

export const UPDATE_CONTACTS = options('updateContacts', [
  ['Person submitting this form', 'submitter'],
  ['Volunteer Coordinator', 'coordinator'],
  ['Communications Representative', 'communications'],
  ['Other', 'other'],
]);

export const REVIEW_FREQUENCIES = options('reviewFrequencies', [
  ['Every 3 Months', 'threeMonths'],
  ['Every 6 Months', 'sixMonths'],
  ['Annually', 'annually'],
  ['Only When Changes Occur', 'whenChanged'],
]);

export const ENGAGEMENT_INTERESTS = options('engagement', [
  ['Volunteer Recruitment Events', 'recruitment'],
  ['Community Collaboration Opportunities', 'collaboration'],
  ['Non-Profit Networking', 'networking'],
  ['Training and Education', 'training'],
  ['Funding or Grant Opportunities', 'funding'],
  ['None at This Time', 'none'],
]);

export function labelFor(list, value, t) {
  const match = list.find(option => option.value === value);
  return match ? t(match.labelKey) : value;
}
