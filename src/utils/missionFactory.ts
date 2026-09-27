import {
  Mission,
  MissionCode,
  MissionDOMContext,
  MissionDifficulty,
  MissionStarterCode,
  MissionType,
  CodeLanguage,
  ValidationResult,
  MistakeCategory,
  CommonMistakeDef,
} from '../types';
import {
  normalizeMissionCode,
  createDOMContext,
  checkCommonMistakes,
} from './domValidator';

export interface MissionInput {
  id: string;
  globalNumber: number;
  missionIndexInSection: number;
  sectionId: any;
  type?: MissionType;
  difficulty?: MissionDifficulty;
  title: string;
  subtitle?: string;
  shortLesson: string; // LEARN
  learnExplanation?: string;
  objective: string; // OBJECTIVE
  instructions: string; // TASK
  task?: string;
  tryTask?: string;
  requiredConcepts?: string[];
  languages?: CodeLanguage[];
  defaultLanguage?: CodeLanguage;
  teachBreakdown?: Array<{
    title: string;
    description: string;
    code?: string;
    highlight?: string;
  }>;
  brainTrainerTip?: string;
  starterCode: MissionStarterCode;
  expectedResult: string;
  hints: [string, string, string];
  commonMistakes?: CommonMistakeDef[];
  successMessage?: string;
  failureMessage?: string;
  xpReward?: number;
  summaryLearned?: string;
  tagsTaught?: string[];
  repetitionConcept?: string;
  conceptKey: string;
  conceptShort?: string;
  fullSolutionCode?: string | { html?: string; css?: string; js?: string };
  // Either a custom DOM/behavior validator or declarative tests
  validate?: (
    code: MissionCode,
    dom: MissionDOMContext
  ) => Promise<ValidationResult> | ValidationResult;
  // Or quick declarative rules
  rules?: {
    elementSelector?: string;
    expectedText?: string;
    caseSensitive?: boolean;
    styleChecks?: { selector: string; property: string; expectedValues: string[] }[];
    interactionCheck?: (dom: MissionDOMContext) => Promise<boolean> | boolean;
  };
}

export const DEFAULT_XP_BY_TYPE: Record<MissionType, number> = {
  normal: 50,
  memory: 100,
  recovery: 30,
  mini_project: 250,
  assessment: 500,
};

/**
 * Mission Factory
 * Generates modular, fully configured missions with automatic DOM validation,
 * mistake detection, and default XP/difficulty assignments.
 */
export function createMission(input: MissionInput): Mission {
  const type: MissionType = input.type || 'normal';
  const difficulty: MissionDifficulty = input.difficulty || 'BEGINNER';
  const xpReward = input.xpReward ?? DEFAULT_XP_BY_TYPE[type] ?? 50;
  const languages: CodeLanguage[] = input.languages && input.languages.length > 0
    ? input.languages
    : ['html'];

  const shortLesson = input.shortLesson || input.learnExplanation || '';
  const instructions = input.instructions || input.task || input.tryTask || '';
  const successMessage = input.successMessage || 'Outstanding! You successfully completed this mission.';
  const failureMessage = input.failureMessage || 'The objective was not met yet. Review the instructions and try again.';
  const conceptShort = input.conceptShort || shortLesson.slice(0, 75);

  const mission: Mission = {
    id: input.id,
    globalNumber: input.globalNumber,
    missionIndexInSection: input.missionIndexInSection,
    sectionId: input.sectionId,
    type,
    difficulty,
    title: input.title,
    subtitle: input.subtitle || `Mission ${input.globalNumber}`,
    shortLesson,
    learnExplanation: shortLesson,
    objective: input.objective,
    instructions,
    task: instructions,
    tryTask: instructions,
    requiredConcepts: input.requiredConcepts || [input.conceptKey],
    languages,
    defaultLanguage: input.defaultLanguage,
    teachBreakdown: input.teachBreakdown,
    brainTrainerTip: input.brainTrainerTip,
    starterCode: input.starterCode,
    expectedResult: input.expectedResult,
    hints: input.hints,
    commonMistakes: input.commonMistakes || [],
    successMessage,
    failureMessage,
    xpReward,
    summaryLearned: input.summaryLearned || successMessage,
    tagsTaught: input.tagsTaught || [],
    repetitionConcept: input.repetitionConcept,
    isMemoryMission: type === 'memory',
    isMiniProject: type === 'mini_project',
    conceptKey: input.conceptKey,
    conceptShort,
    fullSolutionCode: input.fullSolutionCode,
    validate: async (
      rawCode: string | MissionCode,
      providedDom?: MissionDOMContext
    ): Promise<ValidationResult> => {
      const code = normalizeMissionCode(rawCode);

      // 1. Check common syntax/structural mistakes
      const commonMistake = checkCommonMistakes(code, languages);
      if (commonMistake) {
        return {
          isCorrect: false,
          message: 'MISSION FAILED',
          friendlyExplanation: commonMistake.explanation,
          mistakeCategory: commonMistake.category,
          hint: commonMistake.hint,
          xpPenalty: 5,
          conceptKey: input.conceptKey,
        };
      }

      // 2. Setup DOM context if not supplied
      let dom = providedDom;
      let cleanup = () => {};
      if (!dom) {
        const domResult = await createDOMContext(code);
        dom = domResult.context;
        cleanup = domResult.cleanup;
      }

      try {
        // If custom validator provided
        if (input.validate) {
          const res = await input.validate(code, dom);
          return res;
        }

        // Declarative rules
        if (input.rules) {
          const { elementSelector, expectedText, caseSensitive, styleChecks, interactionCheck } = input.rules;

          // Element existence & text check
          if (elementSelector) {
            const el = dom.getElement(elementSelector);
            if (!el) {
              return {
                isCorrect: false,
                message: 'MISSION FAILED',
                friendlyExplanation: `Could not find any element matching <${elementSelector}> in your HTML.`,
                mistakeCategory: 'misspelled_tag',
                hint: `Create the element: <${elementSelector}>`,
                xpPenalty: 5,
                conceptKey: input.conceptKey,
              };
            }

            if (expectedText !== undefined) {
              const actualText = el.textContent?.trim() || '';
              const matches = caseSensitive
                ? actualText === expectedText.trim()
                : actualText.toLowerCase() === expectedText.trim().toLowerCase();

              if (!matches) {
                return {
                  isCorrect: false,
                  message: 'MISSION FAILED',
                  friendlyExplanation: `Found <${elementSelector}>, but its text is "${actualText}" instead of "${expectedText}".`,
                  mistakeCategory: 'wrong_text',
                  hint: `Make sure the text inside matches: "${expectedText}".`,
                  xpPenalty: 5,
                  conceptKey: input.conceptKey,
                };
              }
            }
          }

          // Style checks (CSS)
          if (styleChecks && styleChecks.length > 0) {
            for (const sc of styleChecks) {
              const computed = dom.getComputedStyle(sc.selector);
              if (!computed) {
                return {
                  isCorrect: false,
                  message: 'MISSION FAILED',
                  friendlyExplanation: `Could not find element "${sc.selector}" to check its style.`,
                  mistakeCategory: 'misspelled_tag',
                  hint: `Make sure an element with selector "${sc.selector}" exists in your HTML.`,
                  xpPenalty: 5,
                  conceptKey: input.conceptKey,
                };
              }

              const actualVal = (computed as any)[sc.property] || computed.getPropertyValue(sc.property);
              const isMatch = sc.expectedValues.some((v) =>
                actualVal.toLowerCase().includes(v.toLowerCase())
              );

              if (!isMatch) {
                return {
                  isCorrect: false,
                  message: 'MISSION FAILED',
                  friendlyExplanation: `The CSS style "${sc.property}" on "${sc.selector}" is not set correctly. Found: "${actualVal}".`,
                  mistakeCategory: 'wrong_css_property',
                  hint: `Style ${sc.selector} in the CSS tab with ${sc.property}.`,
                  xpPenalty: 5,
                  conceptKey: input.conceptKey,
                };
              }
            }
          }

          // Interaction checks (JS)
          if (interactionCheck) {
            const pass = await interactionCheck(dom);
            if (!pass) {
              return {
                isCorrect: false,
                message: 'MISSION FAILED',
                friendlyExplanation: 'The interactive action did not produce the expected result when triggered.',
                mistakeCategory: 'incorrect_event_handling',
                hint: 'Check your JavaScript event listener and ensure it modifies the DOM when clicked.',
                xpPenalty: 5,
                conceptKey: input.conceptKey,
              };
            }
          }

          return {
            isCorrect: true,
            message: 'PASSED',
            friendlyExplanation: successMessage,
            hint: '',
          };
        }

        return {
          isCorrect: true,
          message: 'PASSED',
          friendlyExplanation: successMessage,
          hint: '',
        };
      } finally {
        cleanup();
      }
    },
  };

  return mission;
}
