import { UserProfile, SectionId, MistakeCategory, AssessmentResult, CompletedProject } from '../types';
import { MISSIONS } from '../data/missions';
import { SECTIONS } from '../data/sections';
import { BADGES } from '../data/badges';

const PROFILES_STORAGE_KEY = 'internet_mission_profiles_v2';
const ACTIVE_PROFILE_KEY = 'internet_mission_active_profile_id_v2';

const DEFAULT_MISTAKES: Record<MistakeCategory, number> = {
  missing_closing_tag: 0,
  misspelled_tag: 0,
  missing_attribute: 0,
  missing_quotes: 0,
  wrong_css_property: 0,
  wrong_js_syntax: 0,
  wrong_text: 0,
  incorrect_event_handling: 0,
  missing_event_listener: 0,
  missing_element: 0,
  attribute_error: 0,
  logic_mistake: 0,
  empty_code: 0,
};

export function getAllProfiles(): Record<string, UserProfile> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading profiles from localStorage:', e);
  }
  return {};
}

export function saveAllProfiles(profiles: Record<string, UserProfile>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Error saving profiles to localStorage:', e);
  }
}

export function getActiveProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfileId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
}

export function getActiveProfile(): UserProfile | null {
  const activeId = getActiveProfileId();
  if (!activeId) return null;
  const profiles = getAllProfiles();
  const profile = profiles[activeId];
  if (!profile) return null;

  // Safe defaults for new features
  if (!profile.completedProjects) profile.completedProjects = [];
  if (!profile.dailyChallengesCompleted) profile.dailyChallengesCompleted = [];
  if (profile.learningTimeMinutes === undefined) profile.learningTimeMinutes = 15;
  if (profile.buildWithoutHelpCount === undefined) profile.buildWithoutHelpCount = 0;

  // Streak verification
  const today = new Date().toISOString().split('T')[0];
  if (profile.lastActiveDate && profile.lastActiveDate !== today) {
    const last = new Date(profile.lastActiveDate);
    const now = new Date(today);
    const diffDays = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      profile.streak += 1;
    } else if (diffDays > 1) {
      profile.streak = 1;
    }
    profile.lastActiveDate = today;
    saveProfile(profile);
  }

  return profile;
}

export function saveProfile(profile: UserProfile): void {
  const profiles = getAllProfiles();
  profiles[profile.id] = {
    ...profile,
    lastActiveDate: new Date().toISOString().split('T')[0],
  };
  saveAllProfiles(profiles);
}

export function createProfile(name: string, username: string, password: string): UserProfile {
  const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  const newProfile: UserProfile = {
    id,
    name: name.trim() || 'Learner',
    username: username.trim().toLowerCase(),
    password, // Local learning-game profile credential
    createdAt: now,
    lastLoginAt: now,
    xp: 0,
    streak: 1,
    lastActiveDate: today,
    currentSectionId: 'section-1',
    currentMissionId: MISSIONS[0].id,
    completedMissionIds: [],
    completedSectionIds: [],
    unlockedBadgeIds: [],
    codeSnippets: {},
    soundEnabled: true,
    mistakesCount: 0,
    fixedMistakesCount: 0,
    commonMistakes: { ...DEFAULT_MISTAKES },
    weakAreas: {},
    masteredObjectives: [],
    assessmentHistory: [],
    completedCodeMemoryIds: [],
    failedSectionRestartNotice: null,
    completedProjects: [],
    dailyChallengesCompleted: [],
    learningTimeMinutes: 10,
    firstCodeRunAchieved: false,
    buildWithoutHelpCount: 0,
  };

  const profiles = getAllProfiles();
  profiles[id] = newProfile;
  saveAllProfiles(profiles);
  setActiveProfileId(id);

  return newProfile;
}

export function loginProfile(
  username: string,
  password: string
): { success: boolean; profile?: UserProfile; error?: string } {
  const profiles = getAllProfiles();
  const cleanUsername = username.trim().toLowerCase();

  const found = Object.values(profiles).find(
    (p) => p.username === cleanUsername
  );

  if (!found) {
    return { success: false, error: 'No profile found with that username.' };
  }

  if (found.password && found.password !== password) {
    return { success: false, error: 'Incorrect password for this profile.' };
  }

  found.lastLoginAt = new Date().toISOString();
  saveProfile(found);
  setActiveProfileId(found.id);

  return { success: true, profile: found };
}

export function logoutProfile(): void {
  setActiveProfileId(null);
}

export function resetProfileProgress(profile: UserProfile): UserProfile {
  const updated: UserProfile = {
    ...profile,
    xp: 0,
    currentSectionId: 'section-1',
    currentMissionId: MISSIONS[0].id,
    completedMissionIds: [],
    completedSectionIds: [],
    unlockedBadgeIds: [],
    codeSnippets: {},
    mistakesCount: 0,
    fixedMistakesCount: 0,
    commonMistakes: { ...DEFAULT_MISTAKES },
    weakAreas: {},
    masteredObjectives: [],
    assessmentHistory: [],
    completedCodeMemoryIds: [],
    failedSectionRestartNotice: null,
  };
  saveProfile(updated);
  return updated;
}

// Restart Section System when an assessment is failed
export function restartSectionForProfile(
  profile: UserProfile,
  sectionId: SectionId,
  missedObjectives: string[]
): UserProfile {
  const section = SECTIONS.find((s) => s.id === sectionId) || SECTIONS[0];
  const sectionMissions = MISSIONS.filter((m) => m.sectionId === sectionId);
  const firstMission = sectionMissions[0] || MISSIONS[0];

  // Remove this section's missions from completed list so learner replays them
  const sectionMissionIds = new Set(sectionMissions.map((m) => m.id));
  const remainingCompleted = profile.completedMissionIds.filter(
    (id) => !sectionMissionIds.has(id)
  );

  // Keep lifetime XP, lifetime badges, previous completed sections!
  const updated: UserProfile = {
    ...profile,
    currentSectionId: sectionId,
    currentMissionId: firstMission.id,
    completedMissionIds: remainingCompleted,
    failedSectionRestartNotice: {
      sectionId,
      sectionTitle: section.title,
      missedObjectives,
    },
  };

  saveProfile(updated);
  return updated;
}

// Record Project Completion
export function recordCompletedProject(
  profile: UserProfile,
  project: CompletedProject
): UserProfile {
  const existingProjects = profile.completedProjects || [];
  const filtered = existingProjects.filter((p) => p.projectId !== project.projectId);
  const updatedProjects = [project, ...filtered];

  const unlockedBadges = new Set(profile.unlockedBadgeIds || []);
  unlockedBadges.add('first-project');
  unlockedBadges.add('first-website');
  if (project.buildWithoutHelp) {
    unlockedBadges.add('build-without-help');
  }

  const updated: UserProfile = {
    ...profile,
    xp: profile.xp + project.xpEarned,
    completedProjects: updatedProjects,
    unlockedBadgeIds: Array.from(unlockedBadges),
    buildWithoutHelpCount: (profile.buildWithoutHelpCount || 0) + (project.buildWithoutHelp ? 1 : 0),
  };

  saveProfile(updated);
  return updated;
}

// Record Daily Challenge Completion
export function recordDailyChallengeCompleted(
  profile: UserProfile,
  challengeKey: string,
  xpReward: number
): UserProfile {
  const completed = new Set(profile.dailyChallengesCompleted || []);
  const isFirstTimeToday = !completed.has(challengeKey);
  completed.add(challengeKey);

  const unlockedBadges = new Set(profile.unlockedBadgeIds || []);
  unlockedBadges.add('daily-champion');

  const updated: UserProfile = {
    ...profile,
    xp: isFirstTimeToday ? profile.xp + xpReward : profile.xp,
    dailyChallengesCompleted: Array.from(completed),
    unlockedBadgeIds: Array.from(unlockedBadges),
  };

  saveProfile(updated);
  return updated;
}

// Record First Code Run
export function recordCodeRun(profile: UserProfile): UserProfile {
  if (profile.firstCodeRunAchieved) return profile;

  const unlockedBadges = new Set(profile.unlockedBadgeIds || []);
  unlockedBadges.add('first-code-run');

  const updated: UserProfile = {
    ...profile,
    firstCodeRunAchieved: true,
    unlockedBadgeIds: Array.from(unlockedBadges),
  };

  saveProfile(updated);
  return updated;
}

// Backup Export: Generates downloadable JSON backup
export function exportProfileData(profile: UserProfile): void {
  const backupObject = {
    version: '1.2.0',
    exportDate: new Date().toISOString(),
    profile,
  };

  const jsonString = JSON.stringify(backupObject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanName = (profile.username || 'learner').replace(/[^a-z0-9]/gi, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `internet-mission-backup-${cleanName}-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

// Backup Import: Validates and restores user profile from JSON
export function importProfileData(
  jsonString: string
): { success: boolean; profile?: UserProfile; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const profileToRestore: UserProfile = parsed.profile || parsed;

    if (!profileToRestore || !profileToRestore.id || !profileToRestore.username) {
      return {
        success: false,
        error: 'Invalid backup file format: Missing profile identification.',
      };
    }

    // Sanitize and ensure backward-compatibility
    const sanitized: UserProfile = {
      ...profileToRestore,
      completedMissionIds: Array.isArray(profileToRestore.completedMissionIds)
        ? profileToRestore.completedMissionIds
        : [],
      completedSectionIds: Array.isArray(profileToRestore.completedSectionIds)
        ? profileToRestore.completedSectionIds
        : [],
      unlockedBadgeIds: Array.isArray(profileToRestore.unlockedBadgeIds)
        ? profileToRestore.unlockedBadgeIds
        : [],
      codeSnippets: profileToRestore.codeSnippets || {},
      completedProjects: Array.isArray(profileToRestore.completedProjects)
        ? profileToRestore.completedProjects
        : [],
      dailyChallengesCompleted: Array.isArray(profileToRestore.dailyChallengesCompleted)
        ? profileToRestore.dailyChallengesCompleted
        : [],
      learningTimeMinutes: profileToRestore.learningTimeMinutes || 20,
    };

    const allProfiles = getAllProfiles();
    allProfiles[sanitized.id] = sanitized;
    saveAllProfiles(allProfiles);
    setActiveProfileId(sanitized.id);

    return { success: true, profile: sanitized };
  } catch (err: any) {
    return {
      success: false,
      error: `Could not parse backup file: ${err.message || 'Corrupt JSON'}`,
    };
  }
}

