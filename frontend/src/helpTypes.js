const HELP_TYPES = [
  { value: 'Senior Care Support', labelKey: 'options.helpTypes.seniorCare' },
  { value: 'Meal Assistance', labelKey: 'options.helpTypes.meal' },
  { value: 'Transportation Support', labelKey: 'options.helpTypes.transportation' },
  { value: 'Medical Assistance', labelKey: 'options.helpTypes.medical' },
  { value: 'Mental Health Support', labelKey: 'options.helpTypes.mentalHealth' },
  { value: 'Housing Support', labelKey: 'options.helpTypes.housing' },
  { value: 'Other', labelKey: 'options.helpTypes.other' },
];

export const HELP_TYPE_KEYS = Object.fromEntries(HELP_TYPES.map(type => [type.value, type.labelKey]));

export default HELP_TYPES;
