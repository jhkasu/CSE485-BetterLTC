const ORG_CATEGORIES = [
  { value: 'Health', labelKey: 'options.orgCategories.health' },
  { value: 'Seniors Services', labelKey: 'options.orgCategories.seniors' },
  { value: 'Youth', labelKey: 'options.orgCategories.youth' },
  { value: 'Education', labelKey: 'options.orgCategories.education' },
  { value: 'Environment', labelKey: 'options.orgCategories.environment' },
  { value: 'Arts and Culture', labelKey: 'options.orgCategories.arts' },
  { value: 'Community Services', labelKey: 'options.orgCategories.community' },
  { value: 'Other', labelKey: 'options.orgCategories.other' },
];

export const ORG_CATEGORY_KEYS = Object.fromEntries(ORG_CATEGORIES.map(c => [c.value, c.labelKey]));

export default ORG_CATEGORIES;
