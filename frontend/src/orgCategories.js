const ORG_CATEGORIES = [
  { value: 'Seniors and Healthy Aging', labelKey: 'options.orgCategories.seniors' },
  { value: 'Health Care and Wellness', labelKey: 'options.orgCategories.health' },
  { value: 'Mental Health and Wellbeing', labelKey: 'options.orgCategories.mentalHealth' },
  { value: 'Disability Services and Accessibility', labelKey: 'options.orgCategories.disability' },
  { value: 'Children and Youth', labelKey: 'options.orgCategories.childrenYouth' },
  { value: 'Education and Literacy', labelKey: 'options.orgCategories.education' },
  { value: 'Employment and Career Development', labelKey: 'options.orgCategories.employment' },
  { value: 'Indigenous Communities and Reconciliation', labelKey: 'options.orgCategories.indigenous' },
  { value: 'Newcomer and Immigrant Support', labelKey: 'options.orgCategories.newcomers' },
  { value: 'Poverty Reduction', labelKey: 'options.orgCategories.poverty' },
  { value: 'Food Security', labelKey: 'options.orgCategories.food' },
  { value: 'Housing and Homelessness', labelKey: 'options.orgCategories.housing' },
  { value: 'Social Isolation and Community Connection', labelKey: 'options.orgCategories.isolation' },
  { value: 'Family and Caregiver Support', labelKey: 'options.orgCategories.familyCaregivers' },
  { value: 'Arts, Culture and Heritage', labelKey: 'options.orgCategories.arts' },
  { value: 'Sports and Recreation', labelKey: 'options.orgCategories.sports' },
  { value: 'Environment and Sustainability', labelKey: 'options.orgCategories.environment' },
  { value: 'Animal Welfare', labelKey: 'options.orgCategories.animals' },
  { value: 'Emergency Response and Disaster Relief', labelKey: 'options.orgCategories.emergency' },
  { value: 'Human Rights and Social Justice', labelKey: 'options.orgCategories.humanRights' },
  { value: 'Community Safety', labelKey: 'options.orgCategories.safety' },
  { value: 'Research and Innovation', labelKey: 'options.orgCategories.research' },
  { value: 'Other', labelKey: 'options.orgCategories.other' },
];

export const ORG_CATEGORY_KEYS = Object.fromEntries(ORG_CATEGORIES.map(c => [c.value, c.labelKey]));

export default ORG_CATEGORIES;
