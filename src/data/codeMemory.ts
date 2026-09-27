import { CodeMemoryChallenge, ValidationResult } from '../types';

function parseHtmlDoc(code: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(code, 'text/html');
}

export const CODE_MEMORY_CHALLENGES: CodeMemoryChallenge[] = [
  {
    id: 'cm-1',
    number: 1,
    title: 'Drill 1: The Cyan Heading',
    difficulty: 'Easy',
    prompt: 'What code could create this main heading?',
    previewHtml: '<h1 style="color: #38bdf8; font-size: 24px; font-weight: bold; margin: 0;">Hello Internet</h1>',
    targetDescription: 'A level-1 heading (<h1>) containing the text "Hello Internet".',
    starterCode: '',
    hints: [
      'Clue: Remember the primary heading tag you learned first.',
      'Concept: Use <h1> to open and </h1> to close.',
      'Example structure: <h1>Some Title</h1>',
    ],
    fullSolutionCode: '<h1>Hello Internet</h1>',
    xpReward: 75,
    validate: (code: string): ValidationResult => {
      const trimmed = code.trim();
      if (!trimmed) {
        return {
          isCorrect: false,
          mistakeCategory: 'empty_code',
          message: 'The editor is empty.',
          friendlyExplanation: 'Type your HTML code to reproduce the visual heading.',
          hint: 'Use the <h1> tag.',
        };
      }
      if (!trimmed.includes('<h1') && !trimmed.includes('<H1')) {
        return {
          isCorrect: false,
          mistakeCategory: 'misspelled_tag',
          message: 'Missing the <h1> tag.',
          friendlyExplanation: 'Almost there! The visual shows a level 1 heading, which starts with <h1>.',
          hint: 'Write <h1>...',
        };
      }
      if (!trimmed.includes('</h1>') && !trimmed.includes('</H1>')) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_closing_tag',
          message: 'Missing the closing </h1> tag.',
          friendlyExplanation: 'Almost there! You forgot to close your heading element with </h1>.',
          hint: 'Add </h1> at the end.',
        };
      }
      const doc = parseHtmlDoc(trimmed);
      const h1 = doc.querySelector('h1');
      if (!h1 || h1.textContent?.trim().toLowerCase() !== 'hello internet') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'The text inside the heading must match the visual target.',
          friendlyExplanation: `Found "${h1?.textContent?.trim() || ''}", but the visual clearly says "Hello Internet".`,
          hint: 'Spell it exactly: Hello Internet',
        };
      }
      return {
        isCorrect: true,
        message: 'Visual matched! You recalled the heading structure from memory.',
        friendlyExplanation: 'You identified that an <h1> tag produces the primary page title.',
        hint: '',
      };
    },
  },
  {
    id: 'cm-2',
    number: 2,
    title: 'Drill 2: The Body Paragraph',
    difficulty: 'Easy',
    prompt: 'What code could create this paragraph of text?',
    previewHtml: '<p style="color: #cbd5e1; font-size: 15px; margin: 0;">Coding is fun</p>',
    targetDescription: 'A standard paragraph (<p>) containing the sentence "Coding is fun".',
    starterCode: '',
    hints: [
      'Clue: Which tag represents paragraph body text?',
      'Concept: The letter "p" wraps standard paragraph sentences.',
      'Example structure: <p>Text goes here</p>',
    ],
    fullSolutionCode: '<p>Coding is fun</p>',
    xpReward: 75,
    validate: (code: string): ValidationResult => {
      const trimmed = code.trim();
      if (!trimmed) {
        return {
          isCorrect: false,
          mistakeCategory: 'empty_code',
          message: 'Input required.',
          friendlyExplanation: 'Type the HTML tag that creates a paragraph.',
          hint: 'Use <p>...</p>',
        };
      }
      if (!trimmed.includes('<p') && !trimmed.includes('<P')) {
        return {
          isCorrect: false,
          mistakeCategory: 'misspelled_tag',
          message: 'Missing the <p> tag.',
          friendlyExplanation: 'Paragraphs start with <p>.',
          hint: 'Start with <p>',
        };
      }
      if (!trimmed.includes('</p>') && !trimmed.includes('</P>')) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_closing_tag',
          message: 'Missing closing </p> tag.',
          friendlyExplanation: 'Almost there! You forgot to close your paragraph element with </p>.',
          hint: 'Add </p>',
        };
      }
      const doc = parseHtmlDoc(trimmed);
      const p = doc.querySelector('p');
      const text = p?.textContent?.trim().toLowerCase().replace(/[.]+$/, '');
      if (text !== 'coding is fun') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Text does not match target.',
          friendlyExplanation: `The visual displays "Coding is fun", but your code has "${p?.textContent?.trim()}".`,
          hint: 'Match the text: Coding is fun',
        };
      }
      return {
        isCorrect: true,
        message: 'Visual matched! Flawless paragraph recall.',
        friendlyExplanation: 'You recalled that <p> creates clean body text blocks.',
        hint: '',
      };
    },
  },
  {
    id: 'cm-3',
    number: 3,
    title: 'Drill 3: The Action Button',
    difficulty: 'Easy',
    prompt: 'What code could create this clickable button?',
    previewHtml: '<button style="background: #0284c7; color: white; padding: 8px 18px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer;">Submit</button>',
    targetDescription: 'A clickable <button> element with the label "Submit".',
    starterCode: '',
    hints: [
      'Clue: What element tag represents clickable buttons?',
      'Concept: Use <button> to open and </button> to close.',
      'Example structure: <button>Label</button>',
    ],
    fullSolutionCode: '<button>Submit</button>',
    xpReward: 85,
    validate: (code: string): ValidationResult => {
      const trimmed = code.trim();
      if (!trimmed.toLowerCase().includes('<button')) {
        return {
          isCorrect: false,
          mistakeCategory: 'misspelled_tag',
          message: 'Missing the <button> tag.',
          friendlyExplanation: 'Buttons require the <button> element tag.',
          hint: 'Type <button>...',
        };
      }
      if (!trimmed.toLowerCase().includes('</button>')) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_closing_tag',
          message: 'Missing the </button> closing tag.',
          friendlyExplanation: 'Almost there! You forgot to close your button element with </button>.',
          hint: 'Add </button>',
        };
      }
      const doc = parseHtmlDoc(trimmed);
      const btn = doc.querySelector('button');
      if (btn?.textContent?.trim().toLowerCase() !== 'submit') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'The button label should be "Submit".',
          friendlyExplanation: `Your button says "${btn?.textContent?.trim()}", but should say "Submit".`,
          hint: 'Write "Submit" between <button> and </button>.',
        };
      }
      return {
        isCorrect: true,
        message: 'Visual matched! Your code creates the clickable element.',
        friendlyExplanation: 'You remembered that <button> provides interactive affordance.',
        hint: '',
      };
    },
  },
  {
    id: 'cm-4',
    number: 4,
    title: 'Drill 4: The Hyperlink',
    difficulty: 'Medium',
    prompt: 'What code could create this link to https://code.org?',
    previewHtml: '<a href="https://code.org" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">Learn Code</a>',
    targetDescription: 'An anchor link (<a>) pointing to "https://code.org" with text "Learn Code".',
    starterCode: '',
    hints: [
      'Clue: Hyperlinks use the anchor tag <a> and href attribute.',
      'Concept: <a href="URL">Visible Text</a>',
      'Example structure: <a href="https://site.com">Click</a>',
    ],
    fullSolutionCode: '<a href="https://code.org">Learn Code</a>',
    xpReward: 100,
    validate: (code: string): ValidationResult => {
      const trimmed = code.trim();
      if (!trimmed.toLowerCase().includes('<a')) {
        return {
          isCorrect: false,
          mistakeCategory: 'misspelled_tag',
          message: 'Missing <a> tag.',
          friendlyExplanation: 'Hyperlinks require the <a> (anchor) element.',
          hint: 'Start with <a',
        };
      }
      if (!trimmed.toLowerCase().includes('href')) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_attribute',
          message: 'Missing href attribute.',
          friendlyExplanation: 'Almost there! An anchor tag needs href="..." to specify the destination URL.',
          hint: 'Add href="https://code.org"',
        };
      }
      if (!trimmed.toLowerCase().includes('</a>')) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_closing_tag',
          message: 'Missing closing </a> tag.',
          friendlyExplanation: 'Remember to close your link with </a>.',
          hint: 'Add </a>',
        };
      }
      const doc = parseHtmlDoc(trimmed);
      const a = doc.querySelector('a');
      if (!a?.getAttribute('href')?.includes('code.org')) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_attribute',
          message: 'href must point to https://code.org.',
          friendlyExplanation: 'Make sure your href points to "https://code.org".',
          hint: 'href="https://code.org"',
        };
      }
      if (a.textContent?.trim().toLowerCase() !== 'learn code') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'The link text must be "Learn Code".',
          friendlyExplanation: `The visual link text is "Learn Code", but your code has "${a.textContent?.trim()}".`,
          hint: 'Set text to Learn Code',
        };
      }
      return {
        isCorrect: true,
        message: 'Visual matched! Hyperlink navigation unlocked.',
        friendlyExplanation: 'You recalled that <a href="..."> connects pages across the web.',
        hint: '',
      };
    },
  },
  {
    id: 'cm-5',
    number: 5,
    title: 'Drill 5: Styled Neon Tag',
    difficulty: 'Medium',
    prompt: 'What code could create this emerald styled heading?',
    previewHtml: '<h2 style="color: #10b981; font-weight: bold; margin: 0; font-size: 20px;">System Online</h2>',
    targetDescription: 'An <h2> heading with inline style color set to emerald/lime/green or #10b981 saying "System Online".',
    starterCode: '',
    hints: [
      'Clue: Use the style attribute to change color.',
      'Concept: <h2 style="color: ...">Text</h2>',
      'Example structure: <h2 style="color: green;">Title</h2>',
    ],
    fullSolutionCode: '<h2 style="color: lime;">System Online</h2>',
    xpReward: 120,
    validate: (code: string): ValidationResult => {
      const trimmed = code.trim();
      const doc = parseHtmlDoc(trimmed);
      const h2 = doc.querySelector('h2') || doc.querySelector('h1');
      if (!h2) {
        return {
          isCorrect: false,
          mistakeCategory: 'misspelled_tag',
          message: 'Missing heading tag (<h2>).',
          friendlyExplanation: 'Use <h2> to create the styled heading.',
          hint: '<h2 style="...">...</h2>',
        };
      }
      if (!h2.getAttribute('style')?.toLowerCase().includes('color')) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_css_property',
          message: 'Missing style with color property.',
          friendlyExplanation: 'Almost there! Add a style attribute with color: style="color: lime;" or style="color: green;".',
          hint: 'style="color: lime;"',
        };
      }
      if (h2.textContent?.trim().toLowerCase() !== 'system online') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Text must be "System Online".',
          friendlyExplanation: `Visual shows "System Online", but found "${h2.textContent?.trim()}".`,
          hint: 'Write System Online',
        };
      }
      return {
        isCorrect: true,
        message: 'Visual matched! CSS styling from memory verified.',
        friendlyExplanation: 'You proved that style="color: ..." applies visual styling to HTML structure.',
        hint: '',
      };
    },
  },
  {
    id: 'cm-6',
    number: 6,
    title: 'Drill 6: Interactive Alert Trigger',
    difficulty: 'Hard',
    prompt: 'What code creates this button that triggers an alert saying "Armed!"?',
    previewHtml: '<button onclick="alert(\'Armed!\')" style="background: #dc2626; color: white; padding: 10px 20px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px rgba(220,38,38,0.5);">Arm Defense</button>',
    targetDescription: 'A button with onclick="alert(\'Armed!\')" and text "Arm Defense".',
    starterCode: '',
    hints: [
      'Clue: JavaScript onclick triggers functions when tapped.',
      'Concept: <button onclick="alert(\'Message\')">Label</button>',
      'Example structure: <button onclick="alert(\'Hi\')">Test</button>',
    ],
    fullSolutionCode: '<button onclick="alert(\'Armed!\')">Arm Defense</button>',
    xpReward: 150,
    validate: (code: string): ValidationResult => {
      const trimmed = code.trim();
      const doc = parseHtmlDoc(trimmed);
      const btn = doc.querySelector('button');
      if (!btn) {
        return {
          isCorrect: false,
          mistakeCategory: 'misspelled_tag',
          message: 'Missing the <button> tag.',
          friendlyExplanation: 'Create a button element first.',
          hint: '<button>...</button>',
        };
      }
      const onclick = btn.getAttribute('onclick') || '';
      if (!onclick.toLowerCase().includes('alert')) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_js_syntax',
          message: 'Missing onclick alert handler.',
          friendlyExplanation: 'Almost there! Add onclick="alert(\'Armed!\')" to trigger an alert on tap.',
          hint: 'onclick="alert(\'Armed!\')"',
        };
      }
      if (btn.textContent?.trim().toLowerCase() !== 'arm defense') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Button text should be "Arm Defense".',
          friendlyExplanation: `The button label must say "Arm Defense".`,
          hint: 'Text: Arm Defense',
        };
      }
      return {
        isCorrect: true,
        message: 'Visual matched! Interactive behavior triggered.',
        friendlyExplanation: 'You proved that onclick="alert(...)" wires user interaction to browser events.',
        hint: '',
      };
    },
  },
];
