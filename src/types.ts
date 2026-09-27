export type SectionId =
  | 'section-1'
  | 'section-2'
  | 'section-3'
  | 'section-4'
  | 'section-5'
  | 'section-6'
  | 'section-7';

export type AppView =
  | 'home'
  | 'map'
  | 'projects'
  | 'playground'
  | 'revision'
  | 'memory'
  | 'dashboard'
  | 'mission'
  | 'assessment';

export type StageId = SectionId | string;

export interface SectionInfo {
  id: SectionId;
  number: number;
  title: string;
  subtitle: string;
  conceptSummary: string;
  missionRange: [number, number]; // [1, 10], [11, 20], etc.
  accentColor: string;
  icon: string;
  requiredSectionId?: SectionId;
  passScorePercent: number; // e.g. 80
  assessmentXpBonus: number; // e.g. 300
}

export interface StageInfo {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  concept?: string;
  conceptSummary?: string;
  missionRange?: [number, number]; // [1, 10], [11, 20], etc.
  accentColor?: string;
  icon?: string;
  requiredStageId?: string;
  requiredSectionId?: SectionId;
  passScorePercent?: number; // e.g. 80
  assessmentXpBonus?: number; // e.g. 300
}

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  badgeColor: string;
  description: string;
}

export type CodeLanguage = 'html' | 'css' | 'javascript';

export type MissionType =
  | 'normal'
  | 'memory'
  | 'recovery'
  | 'mini_project'
  | 'assessment';

export type MissionDifficulty =
  | 'BEGINNER'
  | 'EASY'
  | 'MEDIUM'
  | 'HARD'
  | 'PROJECT';

export interface MissionCode {
  html: string;
  css: string;
  js: string;
}

export type MissionStarterCode =
  | string
  | {
      html?: string;
      css?: string;
      js?: string;
    };

export type MistakeCategory =
  | 'missing_closing_tag'
  | 'misspelled_tag'
  | 'missing_attribute'
  | 'missing_quotes'
  | 'wrong_css_property'
  | 'wrong_js_syntax'
  | 'wrong_text'
  | 'incorrect_event_handling'
  | 'missing_event_listener'
  | 'missing_element'
  | 'attribute_error'
  | 'logic_mistake'
  | 'empty_code';

export interface MissionDOMContext {
  doc: Document;
  html: string;
  css: string;
  js: string;
  combined: string;
  getElement: (selector: string) => Element | null;
  getComputedStyle: (selector: string) => CSSStyleDeclaration | null;
  simulateClick: (selector: string) => Promise<boolean> | boolean;
  iframeWindow?: Window | null;
}

export interface CommonMistakeDef {
  pattern?: RegExp | string;
  description: string;
  hint: string;
  category?: MistakeCategory;
}

export interface ValidationResult {
  isCorrect: boolean;
  message: string;
  mistakeCategory?: MistakeCategory;
  friendlyExplanation: string;
  hint: string;
  xpPenalty?: number;
  conceptKey?: string;
}

export interface Mission {
  id: string;
  globalNumber: number; // 1 to 70
  missionIndexInSection: number; // 1 to 10
  sectionId: SectionId;
  type?: MissionType;
  difficulty?: MissionDifficulty;
  title: string;
  subtitle?: string;
  shortLesson?: string; // LEARN
  learnExplanation: string; // LEARN (backward compat)
  objective: string; // OBJECTIVE
  instructions?: string; // TASK
  task: string; // TASK (backward compat)
  tryTask?: string; // alias for task
  requiredConcepts?: string[];
  languages?: CodeLanguage[]; // ['html', 'css', 'javascript']
  defaultLanguage?: CodeLanguage; // Active tab when opening the editor
  teachBreakdown?: Array<{
    title: string;
    description: string;
    code?: string;
    highlight?: string;
  }>;
  brainTrainerTip?: string;
  starterCode: MissionStarterCode;
  expectedResult?: string;
  hints: [string, string, string]; // Hint 1, Hint 2, Hint 3
  commonMistakes?: CommonMistakeDef[];
  successMessage?: string;
  failureMessage?: string;
  fullSolutionCode?: string | { html?: string; css?: string; js?: string };
  xpReward: number;
  summaryLearned: string;
  tagsTaught: string[];
  repetitionConcept?: string;
  isMemoryMission?: boolean;
  isMiniProject?: boolean;
  conceptKey: string;
  conceptShort: string;
  validate: (
    code: any,
    domContext?: MissionDOMContext
  ) => Promise<ValidationResult> | ValidationResult;
}

export type QuestionType =
  | 'multiple_choice'
  | 'identify_code'
  | 'fix_mistake'
  | 'write_code';

export interface AssessmentQuestion {
  id: string;
  sectionId: SectionId;
  type: QuestionType;
  conceptKey: string;
  objective: string;
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  codeSnippet?: string;
  starterCode?: string;
  explanation: string;
  validateCode?: (code: string) => { isCorrect: boolean; feedback: string };
}

export interface AssessmentResult {
  id: string;
  sectionId: SectionId;
  sectionTitle: string;
  date: string;
  scorePercent: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswersCount: number;
  missedObjectives: string[];
  xpAwarded: number;
  notes: string;
}

export interface RecoveryMission {
  id: string;
  conceptKey: string;
  conceptName: string;
  objective: string;
  task: string;
  starterCode: string;
  hints: [string, string, string];
  fullSolutionCode: string;
  xpReward: number;
  validate: (code: string) => ValidationResult;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface CompletedProject {
  id: string;
  projectId: string;
  title: string;
  completedAt: string;
  xpEarned: number;
  html: string;
  css: string;
  js: string;
  buildWithoutHelp?: boolean;
}

export interface ProjectRequirement {
  id: string;
  label: string;
  description: string;
  check: (domContext: MissionDOMContext) => boolean;
}

export interface ProjectDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  xpReward: number;
  buildWithoutHelpBonusXp: number;
  starterCode: {
    html: string;
    css: string;
    js: string;
  };
  requirements: ProjectRequirement[];
  hints: [string, string, string];
  previewMockHtml?: string;
}

export interface DailyChallenge {
  id: string;
  dateKey: string; // e.g. 'monday' or '2026-09-26'
  dayIndex: number; // 0 to 6
  title: string;
  category: 'HTML' | 'CSS' | 'JavaScript';
  concept: string;
  objective: string;
  instructions: string;
  starterCode: {
    html: string;
    css: string;
    js: string;
  };
  xpReward: number;
  hints: [string, string, string];
  validate: (
    code: { html: string; css: string; js: string },
    domContext?: MissionDOMContext
  ) => Promise<ValidationResult> | ValidationResult;
}

export interface CodeMemoryChallenge {
  id: string;
  number: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prompt: string;
  previewHtml: string;
  targetDescription: string;
  starterCode: string;
  hints: [string, string, string];
  fullSolutionCode: string;
  xpReward: number;
  validate: (code: string) => ValidationResult;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  password: string; // Stored locally for learning-game profile
  createdAt: string;
  lastLoginAt: string;
  xp: number;
  streak: number;
  lastActiveDate: string;
  currentSectionId: SectionId;
  currentMissionId: string;
  completedMissionIds: string[]; // Set of mission IDs currently completed
  completedSectionIds: SectionId[]; // Passed assessments
  unlockedBadgeIds: string[];
  codeSnippets: Record<string, string>;
  soundEnabled: boolean;
  musicEnabled?: boolean;
  mistakesCount: number;
  fixedMistakesCount: number;
  commonMistakes: Record<MistakeCategory, number>;
  weakAreas: Record<string, number>; // conceptKey -> failure count
  masteredObjectives: string[]; // List of mastered objective strings
  assessmentHistory: AssessmentResult[];
  completedCodeMemoryIds: string[];
  failedSectionRestartNotice?: {
    sectionId: SectionId;
    sectionTitle: string;
    missedObjectives: string[];
  } | null;
  // Learning & Project Mode Extensions
  completedProjects?: CompletedProject[];
  dailyChallengesCompleted?: string[]; // Array of date strings 'YYYY-MM-DD'
  learningTimeMinutes?: number;
  firstCodeRunAchieved?: boolean;
  buildWithoutHelpCount?: number;
}

export type UserProgress = UserProfile;
