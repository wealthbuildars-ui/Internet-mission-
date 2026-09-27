import { SectionInfo } from '../types';

export const SECTIONS: SectionInfo[] = [
  {
    id: 'section-1',
    number: 1,
    title: 'HTML FOUNDATION',
    subtitle: 'Core Structure, Headings, Paragraphs, Lists, Links, Images & Cards',
    conceptSummary: 'HTML creates the structure and skeleton of every webpage.',
    missionRange: [1, 10],
    accentColor: 'from-cyan-500 to-blue-600',
    icon: 'Layers',
    passScorePercent: 80,
    assessmentXpBonus: 300,
  },
  {
    id: 'section-2',
    number: 2,
    title: 'CSS FOUNDATION',
    subtitle: 'Colors, Typography, Box Model, Padding, Borders & Styled Cards',
    conceptSummary: 'CSS styles and designs how your webpage looks.',
    missionRange: [11, 20],
    accentColor: 'from-teal-400 to-emerald-600',
    icon: 'Palette',
    requiredSectionId: 'section-1',
    passScorePercent: 80,
    assessmentXpBonus: 400,
  },
  {
    id: 'section-3',
    number: 3,
    title: 'JAVASCRIPT FOUNDATION',
    subtitle: 'Variables, Button Clicks, DOM Updates, State Counters & User Input',
    conceptSummary: 'JavaScript makes your webpage interactive and dynamic.',
    missionRange: [21, 30],
    accentColor: 'from-amber-400 to-orange-600',
    icon: 'Zap',
    requiredSectionId: 'section-2',
    passScorePercent: 80,
    assessmentXpBonus: 500,
  },
];

