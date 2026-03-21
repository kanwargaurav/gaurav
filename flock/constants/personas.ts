export interface Persona {
  id: string;
  name: string;
  emoji: string;
  description: string;
  traits: string[];
  color: string;
}

export const Personas: Persona[] = [
  {
    id: 'family',
    name: 'Family',
    emoji: '👨‍👩‍👧‍👦',
    description: 'Traveling with kids and extended family',
    traits: ['kid-friendly', 'accessible', 'organized', 'safe'],
    color: '#0BAADF',
  },
  {
    id: 'couple',
    name: 'Couple',
    emoji: '💑',
    description: 'Romantic getaways and couple adventures',
    traits: ['romantic', 'intimate', 'special-occasions', 'luxury'],
    color: '#EF3F6A',
  },
  {
    id: 'friends',
    name: 'Friends',
    emoji: '🎉',
    description: 'Group trips with your crew',
    traits: ['social', 'nightlife', 'budget-friendly', 'fun'],
    color: '#FF5533',
  },
  {
    id: 'solo',
    name: 'Solo',
    emoji: '🧳',
    description: 'Solo travel and self-discovery',
    traits: ['independent', 'flexible', 'adventurous', 'cultural'],
    color: '#F5A020',
  },
  {
    id: 'business',
    name: 'Business',
    emoji: '💼',
    description: 'Business trips and conferences',
    traits: ['efficient', 'connected', 'professional', 'practical'],
    color: '#7755F0',
  },
  {
    id: 'senior',
    name: 'Senior',
    emoji: '🌿',
    description: 'Relaxed travel for mature travelers',
    traits: ['accessible', 'comfortable', 'cultural', 'wellness'],
    color: '#0BBFA0',
  },
];

export const PersonaMap = Object.fromEntries(
  Personas.map((p) => [p.id, p])
);
