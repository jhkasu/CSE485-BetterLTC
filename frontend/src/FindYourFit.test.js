import { matchRoles, matchingDirectoryUrl, ROLE_TYPES } from './FindYourFit';

test('matches the same original offline role types', () => {
  expect(ROLE_TYPES).toHaveLength(6);
  const matches = matchRoles({
    cause: 'seniors', skill: 'listening', hours: '2', location: 'either',
  });
  expect(matches[0].id).toBe('companion');
  expect(matches).toHaveLength(3);
});

test('respects time and remote participation constraints', () => {
  const matches = matchRoles({
    cause: 'community', skill: 'technology', hours: '1', location: 'remote',
  });
  expect(matches.map(item => item.id)).toEqual(['digital']);
});

test('respects lower physical demand when selected', () => {
  const matches = matchRoles({
    cause: 'environment', skill: 'gardening', hours: '4',
    location: 'in-person', low: 'on',
  });
  expect(matches).toHaveLength(3);
  expect(matches.every(role => role.low)).toBe(true);
  expect(matches.map(role => role.id)).not.toContain('garden');
});

test('maps selected cause and recognized city to the approved directory filters', () => {
  const result = matchingDirectoryUrl({
    cause: 'seniors', city: 'regina', generations: 'on',
  });
  expect(result).toBe('/organizations?category=Seniors+Services&area=Regina&intergenerational=true');
});

test('does not send arbitrary city text as a directory filter', () => {
  expect(matchingDirectoryUrl({ cause: 'community', city: 'Not a known city' }))
    .toBe('/organizations?category=Community+Services');
});
