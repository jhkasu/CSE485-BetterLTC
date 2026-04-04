// Mock user data — replace with real API calls when backend is ready
const mockUsers = [
  {
    id: 1,
    firstName: 'Jooho',
    lastName: 'Kim',
    email: 'jooho@test.com',
    password: 'password123',
    role: 'volunteer',
    backgroundCheckApproved: false,
    upcomingShifts: [
      {
        id: 1,
        title: 'Meal Delivery',
        date: '2026-03-20',
        time: '10:00 AM – 12:00 PM',
        location: 'Sunnybrook LTC, 2075 Bayview Ave',
      },
      {
        id: 2,
        title: 'Social Activity Support',
        date: '2026-03-25',
        time: '2:00 PM – 4:00 PM',
        location: 'Shepherd Village, 3760 Sheppard Ave E',
      },
      {
        id: 3,
        title: 'Recreational Program',
        date: '2026-04-02',
        time: '1:00 PM – 3:00 PM',
        location: 'Extendicare Bayview, 45 Overlea Blvd',
      },
    ],
    volunteerHistory: [
      { id: 1, title: 'Meal Delivery',          date: '2026-03-05', hours: 2,   location: 'Sunnybrook LTC' },
      { id: 2, title: 'Social Activity Support', date: '2026-02-28', hours: 2,   location: 'Shepherd Village' },
      { id: 3, title: 'Reading Program',         date: '2026-02-15', hours: 1.5, location: 'Extendicare Bayview' },
      { id: 4, title: 'Meal Delivery',           date: '2026-01-30', hours: 2,   location: 'Sunnybrook LTC' },
    ],
  },
  {
    id: 2,
    firstName: 'Kim',
    lastName: '',
    email: 'kim@test.com',
    password: 'password123',
    role: 'admin',
    backgroundCheckApproved: true,
    upcomingShifts: [],
    volunteerHistory: [],
  },
];

export default mockUsers;
