import { RecoveryMission, ValidationResult } from '../types';

function parseHtmlDoc(code: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(code, 'text/html');
}

export const RECOVERY_MISSIONS: Record<string, RecoveryMission> = {
  heading: {
    id: 'rec-heading',
    conceptKey: 'heading',
    conceptName: 'HTML Headings',
    objective: 'Re-enforce opening and closing heading syntax <h1>...</h1>',
    task: 'Create an <h1> heading saying "Recovery Complete".',
    starterCode: '',
    hints: [
      'Clue: Remember opening <h1> and closing </h1> with the slash.',
      'Concept: Write the exact text inside: <h1>Recovery Complete</h1>',
      'Example: <h1>Your Title</h1>',
    ],
    fullSolutionCode: '<h1>Recovery Complete</h1>',
    xpReward: 60,
    validate: (code: string): ValidationResult => {
      const trimmed = code.trim();
      const doc = parseHtmlDoc(trimmed);
      const h1 = doc.querySelector('h1');
      if (!h1) {
        return {
          isCorrect: false,
          mistakeCategory: 'misspelled_tag',
          message: 'Missing the <h1> element.',
          friendlyExplanation: 'Use <h1>...</h1> to build the heading.',
          hint: 'Write <h1>Recovery Complete</h1>',
        };
      }
      if (h1.textContent?.trim().toLowerCase() !== 'recovery complete') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'The heading text must be "Recovery Complete".',
          friendlyExplanation: 'Check spelling: Recovery Complete',
          hint: 'Exact: Recovery Complete',
        };
      }
      return {
        isCorrect: true,
        message: 'Recovery Mission Succeeded! Heading syntax restored.',
        friendlyExplanation: 'You proved that you have mastered <h1> tags!',
        hint: '',
      };
    },
  },
  closing_tag: {
    id: 'rec-closing-tag',
    conceptKey: 'closing_tag',
    conceptName: 'Closing Tag Syntax',
    objective: 'Master forward-slash closing tags for standard HTML elements',
    task: 'Create a paragraph that says "Tags are closed properly." with both opening <p> and closing </p>.',
    starterCode: '<p>Tags are closed properly.',
    hints: [
      'Clue: Look at the end of the starter code. What is missing?',
      'Concept: Closing tags always require the slash: </p>',
      'Example: <p>Text</p>',
    ],
    fullSolutionCode: '<p>Tags are closed properly.</p>',
    xpReward: 60,
    validate: (code: string): ValidationResult => {
      const trimmed = code.trim();
      if (!trimmed.includes('</p>') && !trimmed.includes('</P>')) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_closing_tag',
          message: 'Missing the closing </p> tag.',
          friendlyExplanation: 'Add </p> at the very end to close your paragraph.',
          hint: 'End with </p>',
        };
      }
      const doc = parseHtmlDoc(trimmed);
      const p = doc.querySelector('p');
      if (!p || p.textContent?.trim().toLowerCase().replace(/[.]+$/, '') !== 'tags are closed properly') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Text must say "Tags are closed properly."',
          friendlyExplanation: 'Check text spelling inside <p> and </p>.',
          hint: 'Tags are closed properly.',
        };
      }
      return {
        isCorrect: true,
        message: 'Recovery Mission Succeeded! Closing tag discipline unlocked.',
        friendlyExplanation: 'You successfully paired every opening tag with its closing tag!',
        hint: '',
      };
    },
  },
  button: {
    id: 'rec-button',
    conceptKey: 'button',
    conceptName: 'HTML Buttons',
    objective: 'Create clickable buttons with clear text labels',
    task: 'Create a button that says "Confirm Action".',
    starterCode: '',
    hints: [
      'Clue: Button tag is <button> and </button>.',
      'Concept: <button>Label</button>',
      'Example: <button>Submit</button>',
    ],
    fullSolutionCode: '<button>Confirm Action</button>',
    xpReward: 60,
    validate: (code: string): ValidationResult => {
      const trimmed = code.trim();
      const doc = parseHtmlDoc(trimmed);
      const btn = doc.querySelector('button');
      if (!btn) {
        return {
          isCorrect: false,
          mistakeCategory: 'misspelled_tag',
          message: 'Missing the <button> tag.',
          friendlyExplanation: 'Type <button>Confirm Action</button>',
          hint: 'Use <button>...</button>',
        };
      }
      if (btn.textContent?.trim().toLowerCase() !== 'confirm action') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Button text must say "Confirm Action".',
          friendlyExplanation: 'Change button label to "Confirm Action".',
          hint: 'Confirm Action',
        };
      }
      return {
        isCorrect: true,
        message: 'Recovery Mission Succeeded! Button control restored.',
        friendlyExplanation: 'You created a clean, accessible button element.',
        hint: '',
      };
    },
  },
  link: {
    id: 'rec-link',
    conceptKey: 'link',
    conceptName: 'Hyperlinks & href',
    objective: 'Connect web navigation using <a> and href attribute',
    task: 'Create a link pointing to "https://developer.mozilla.org" saying "MDN Docs".',
    starterCode: '',
    hints: [
      'Clue: <a href="...">Visible Text</a>',
      'Concept: The href attribute specifies the destination URL.',
      'Example: <a href="https://example.com">Visit</a>',
    ],
    fullSolutionCode: '<a href="https://developer.mozilla.org">MDN Docs</a>',
    xpReward: 60,
    validate: (code: string): ValidationResult => {
      const trimmed = code.trim();
      const doc = parseHtmlDoc(trimmed);
      const a = doc.querySelector('a');
      if (!a) {
        return {
          isCorrect: false,
          mistakeCategory: 'misspelled_tag',
          message: 'Missing <a> anchor tag.',
          friendlyExplanation: 'Start with <a href="...">.',
          hint: '<a href="...">...</a>',
        };
      }
      if (!a.getAttribute('href')?.includes('mozilla.org')) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_attribute',
          message: 'href attribute must point to "https://developer.mozilla.org".',
          friendlyExplanation: 'Add href="https://developer.mozilla.org" inside <a>.',
          hint: 'href="https://developer.mozilla.org"',
        };
      }
      if (a.textContent?.trim().toLowerCase() !== 'mdn docs') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Link text must say "MDN Docs".',
          friendlyExplanation: 'Place MDN Docs between <a> and </a>.',
          hint: 'MDN Docs',
        };
      }
      return {
        isCorrect: true,
        message: 'Recovery Mission Succeeded! Hyperlink mastery verified.',
        friendlyExplanation: 'You connected an external web URL with semantic link text.',
        hint: '',
      };
    },
  },
  image: {
    id: 'rec-image',
    conceptKey: 'image',
    conceptName: 'Image Elements & Attributes',
    objective: 'Embed pictures using self-closing <img> with src and alt',
    task: 'Add an image with src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300" and alt="Gradient".',
    starterCode: '',
    hints: [
      'Clue: <img> is self-closing and does not need </img>.',
      'Concept: <img src="..." alt="...">',
      'Example: <img src="pic.jpg" alt="Description">',
    ],
    fullSolutionCode: '<img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300" alt="Gradient">',
    xpReward: 60,
    validate: (code: string): ValidationResult => {
      const trimmed = code.trim();
      const doc = parseHtmlDoc(trimmed);
      const img = doc.querySelector('img');
      if (!img) {
        return {
          isCorrect: false,
          mistakeCategory: 'misspelled_tag',
          message: 'Missing <img> tag.',
          friendlyExplanation: 'Embed an image with <img src="..." alt="...">.',
          hint: '<img ...>',
        };
      }
      if (!img.getAttribute('src')?.includes('1579546929518-9e396f3cc809')) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_attribute',
          message: 'Image src does not match URL in prompt.',
          friendlyExplanation: 'Copy the full URL carefully into src="...".',
          hint: 'Check src URL.',
        };
      }
      if (img.getAttribute('alt')?.trim().toLowerCase() !== 'gradient') {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_attribute',
          message: 'alt attribute must say "Gradient".',
          friendlyExplanation: 'Add alt="Gradient".',
          hint: 'alt="Gradient"',
        };
      }
      return {
        isCorrect: true,
        message: 'Recovery Mission Succeeded! Media embed skills restored.',
        friendlyExplanation: 'You embedded an image asset with descriptive alternative text.',
        hint: '',
      };
    },
  },
};
