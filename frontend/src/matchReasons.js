const SHORT_DAY_KEYS = {
  Monday: 'mon', Tuesday: 'tue', Wednesday: 'wed', Thursday: 'thu', Friday: 'fri', Saturday: 'sat', Sunday: 'sun',
};

export function dayList(t, days) {
  return (days || []).map(day => t(`options.daysShort.${SHORT_DAY_KEYS[day]}`, { defaultValue: day })).join(', ');
}

export function languageList(t, languages) {
  return (languages || []).map(lang => t(`dashboard.matching.languageOptions.${lang.toLowerCase()}`, { defaultValue: lang })).join(' / ');
}

export function matchReasons(t, match, extra = {}) {
  const reasons = [];
  if (match.sameCity) reasons.push(t('matching.reasons.sameCity'));
  if (match.matchingDays?.length) reasons.push(t('matching.reasons.days', { days: dayList(t, match.matchingDays) }));
  else if (extra.availableDays?.length) reasons.push(t('matching.reasons.available', { days: dayList(t, extra.availableDays) }));
  if (match.interestMatch) reasons.push(t(extra.forOrganization ? 'matching.reasons.interestedInHelp' : 'matching.reasons.interest'));
  if (match.sharedLanguages?.length) reasons.push(t('matching.reasons.speaks', { languages: languageList(t, match.sharedLanguages) }));
  return reasons;
}
