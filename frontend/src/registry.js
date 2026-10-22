export const REGISTRY_TYPES = [
  { value: 'Charity', labelKey: 'registry.types.Charity', hintKey: 'registry.hints.Charity', placeholder: '123456789RR0001' },
  { value: 'Nonprofit', labelKey: 'registry.types.Nonprofit', hintKey: 'registry.hints.Nonprofit', placeholder: '101234567' },
];

const PATTERNS = {
  Charity: /^\d{9}RR\d{4}$/,
  Nonprofit: /^\d{6,10}$/,
};

export const LOOKUP_LINKS = {
  Charity: [
    { labelKey: 'registry.lookup.cra', url: 'https://apps.cra-arc.gc.ca/ebci/hacc/srch/pub/dsplyBscSrch?request_locale=en' },
  ],
  Nonprofit: [
    { labelKey: 'registry.lookup.saskatchewan', url: 'https://corporateregistry.isc.ca/' },
    { labelKey: 'registry.lookup.federal', url: 'https://ised-isde.canada.ca/cc/lgcy/fdrlCrpSrch.html?locale=en_CA' },
  ],
};

export function normalizeRegistryNumber(value) {
  return (value || '').replace(/[\s-]/g, '').toUpperCase();
}

export function registryError(type, number) {
  if (!PATTERNS[type]) return 'registry.errors.type';
  if (!PATTERNS[type].test(normalizeRegistryNumber(number))) return `registry.errors.${type}`;
  return '';
}
