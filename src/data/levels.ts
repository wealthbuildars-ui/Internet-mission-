import { LevelInfo } from '../types';

export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    title: 'Internet Recruit',
    minXp: 0,
    maxXp: 99,
    badgeColor: 'from-slate-600 to-slate-800 text-slate-200 border-slate-500',
    description: 'Beginning your journey into the architecture of cyberspace.',
  },
  {
    level: 2,
    title: 'HTML Explorer',
    minXp: 100,
    maxXp: 249,
    badgeColor: 'from-cyan-600 to-blue-700 text-cyan-100 border-cyan-400',
    description: 'Mastering tags, structural foundations, and semantic blocks.',
  },
  {
    level: 3,
    title: 'Web Builder',
    minXp: 250,
    maxXp: 449,
    badgeColor: 'from-blue-600 to-indigo-700 text-blue-100 border-blue-400',
    description: 'Assembling complete web components and real digital cards.',
  },
  {
    level: 4,
    title: 'CSS Creator',
    minXp: 450,
    maxXp: 699,
    badgeColor: 'from-teal-600 to-emerald-700 text-teal-100 border-teal-400',
    description: 'Ready to bring style, vibrant colors, and layouts to life.',
  },
  {
    level: 5,
    title: 'JavaScript Rookie',
    minXp: 700,
    maxXp: 999,
    badgeColor: 'from-amber-600 to-orange-700 text-amber-100 border-amber-400',
    description: 'Unlocking interactions, dynamic logic, and cyber events.',
  },
  {
    level: 6,
    title: 'Web Developer',
    minXp: 1000,
    maxXp: 2000,
    badgeColor: 'from-violet-600 to-purple-800 text-purple-100 border-purple-400',
    description: 'Full-fledged cyber architect commanding the modern web.',
  },
];

export function getLevelInfo(xp: number): {
  currentLevel: LevelInfo;
  nextLevel: LevelInfo | null;
  progressPercent: number;
  xpToNext: number;
} {
  const current =
    [...LEVELS].reverse().find((lvl) => xp >= lvl.minXp) || LEVELS[0];
  const next = LEVELS.find((lvl) => lvl.level === current.level + 1) || null;

  if (!next) {
    return {
      currentLevel: current,
      nextLevel: null,
      progressPercent: 100,
      xpToNext: 0,
    };
  }

  const range = next.minXp - current.minXp;
  const earnedInRange = Math.max(0, xp - current.minXp);
  const progressPercent = Math.min(
    100,
    Math.round((earnedInRange / range) * 100)
  );
  const xpToNext = Math.max(0, next.minXp - xp);

  return {
    currentLevel: current,
    nextLevel: next,
    progressPercent,
    xpToNext,
  };
}
