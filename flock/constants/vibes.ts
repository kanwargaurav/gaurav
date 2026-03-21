export interface Vibe {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export const Vibes: Vibe[] = [
  {
    id: 'beach',
    name: 'Beach',
    emoji: '🏖️',
    color: '#0BAADF',
    description: 'Sun, sand, and ocean relaxation',
  },
  {
    id: 'mountains',
    name: 'Mountains',
    emoji: '⛰️',
    color: '#7755F0',
    description: 'Hiking and alpine adventures',
  },
  {
    id: 'city',
    name: 'City',
    emoji: '🏙️',
    color: '#FF5533',
    description: 'Urban exploration and culture',
  },
  {
    id: 'history',
    name: 'History',
    emoji: '🏛️',
    color: '#F5A020',
    description: 'Museums and historical sites',
  },
  {
    id: 'food',
    name: 'Food',
    emoji: '🍽️',
    color: '#EF3F6A',
    description: 'Culinary and dining experiences',
  },
  {
    id: 'adventure',
    name: 'Adventure',
    emoji: '🧗',
    color: '#FF5533',
    description: 'Extreme sports and thrills',
  },
  {
    id: 'wellness',
    name: 'Wellness',
    emoji: '🧘',
    color: '#0BBFA0',
    description: 'Spa, yoga, and relaxation',
  },
  {
    id: 'nightlife',
    name: 'Nightlife',
    emoji: '🍾',
    color: '#EF3F6A',
    description: 'Bars, clubs, and nighttime fun',
  },
  {
    id: 'nature',
    name: 'Nature',
    emoji: '🌲',
    color: '#0BBFA0',
    description: 'Wildlife and natural scenery',
  },
  {
    id: 'culture',
    name: 'Culture',
    emoji: '🎭',
    color: '#7755F0',
    description: 'Arts, traditions, and local customs',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    emoji: '✨',
    color: '#F5A020',
    description: 'High-end resorts and experiences',
  },
  {
    id: 'budget',
    name: 'Budget',
    emoji: '💰',
    color: '#0BAADF',
    description: 'Affordable and backpacker-friendly',
  },
];

export const VibeMap = Object.fromEntries(
  Vibes.map((v) => [v.id, v])
);
