import { Mission, ValidationResult, MissionCode } from '../types';
import { createMission } from '../utils/missionFactory';

function parseHtmlDoc(code: string | MissionCode): Document {
  const parser = new DOMParser();
  const raw = typeof code === 'string' ? code : code?.html || '';
  return parser.parseFromString(raw, 'text/html');
}

export const MISSIONS: Mission[] = [
  // =========================================================================
  // SECTION 1: HTML FOUNDATION (Missions 1–10)
  // Concept: HTML creates the skeleton & structure. No CSS or JS as main concept!
  // =========================================================================

  // Mission 1: Create Your First Heading
  createMission({
    id: 'm1-heading',
    globalNumber: 1,
    missionIndexInSection: 1,
    sectionId: 'section-1',
    type: 'normal',
    difficulty: 'BEGINNER',
    title: 'Create Your First Heading',
    subtitle: 'Page Title Structure with <h1>',
    shortLesson:
      'HTML builds the skeleton of every website. An <h1> tag creates the most important heading on a page. Every opening <h1> must end with a closing </h1>.',
    objective: 'Create a heading that says "My Website".',
    instructions: 'Write an <h1> tag with the text "My Website" and close it with </h1>.',
    requiredConcepts: ['html', 'heading', 'closing_tag'],
    languages: ['html'],
    starterCode: '<!-- Write your heading below -->\n',
    expectedResult: '<h1>My Website</h1>',
    hints: [
      'Clue: Opening tags look like <tag> and closing tags look like </tag>.',
      'Concept: Use <h1> to open, write "My Website", and </h1> to close.',
      'Example: <h1>My Website</h1>',
    ],
    fullSolutionCode: '<h1>My Website</h1>',
    xpReward: 50,
    summaryLearned: 'You created your first HTML heading using <h1> and </h1>.',
    tagsTaught: ['h1'],
    conceptKey: 'heading',
    rules: {
      elementSelector: 'h1',
      expectedText: 'My Website',
    },
  }),

  // Mission 2: Create a Paragraph
  createMission({
    id: 'm2-paragraph',
    globalNumber: 2,
    missionIndexInSection: 2,
    sectionId: 'section-1',
    type: 'normal',
    difficulty: 'BEGINNER',
    title: 'Create a Paragraph',
    subtitle: 'Body Text Blocks with <p>',
    shortLesson:
      'To display regular sentences and body text on a webpage, use the <p> tag, which stands for Paragraph. Place your text between opening <p> and closing </p>.',
    objective: 'Create a paragraph that says "Welcome to my personal site."',
    instructions: 'Write a <p> tag containing "Welcome to my personal site." and close it with </p>.',
    requiredConcepts: ['html', 'paragraph', 'closing_tag'],
    languages: ['html'],
    starterCode: '<!-- Write your paragraph below -->\n',
    expectedResult: '<p>Welcome to my personal site.</p>',
    hints: [
      'Clue: Paragraph begins with the letter "p".',
      'Concept: Wrap your sentence between <p> and </p>.',
      'Example: <p>Welcome to my personal site.</p>',
    ],
    fullSolutionCode: '<p>Welcome to my personal site.</p>',
    xpReward: 50,
    summaryLearned: 'You mastered <p> for body text and readable articles.',
    tagsTaught: ['p'],
    conceptKey: 'paragraph',
    rules: {
      elementSelector: 'p',
      expectedText: 'Welcome to my personal site.',
    },
  }),

  // Mission 3: Create a Button
  createMission({
    id: 'm3-button',
    globalNumber: 3,
    missionIndexInSection: 3,
    sectionId: 'section-1',
    type: 'normal',
    difficulty: 'BEGINNER',
    title: 'Create a Button',
    subtitle: 'User Action Elements with <button>',
    shortLesson:
      'Websites need items visitors can click or tap. The <button> tag creates a clickable button on screen. Write label text between <button> and </button>.',
    objective: 'Create a button that says "Click Me".',
    instructions: 'Write a <button> tag with the label "Click Me" and close it with </button>.',
    requiredConcepts: ['html', 'button', 'closing_tag'],
    languages: ['html'],
    starterCode: '<!-- Create your button below -->\n',
    expectedResult: '<button>Click Me</button>',
    hints: [
      'Clue: The tag name is the full word "button".',
      'Concept: Place the label text between <button> and </button>.',
      'Example: <button>Click Me</button>',
    ],
    fullSolutionCode: '<button>Click Me</button>',
    xpReward: 50,
    summaryLearned: 'You learned how to create interactive action buttons using <button>.',
    tagsTaught: ['button'],
    conceptKey: 'button',
    rules: {
      elementSelector: 'button',
      expectedText: 'Click Me',
    },
  }),

  // Mission 4: Create a List
  createMission({
    id: 'm4-list',
    globalNumber: 4,
    missionIndexInSection: 4,
    sectionId: 'section-1',
    type: 'normal',
    difficulty: 'BEGINNER',
    title: 'Create a List',
    subtitle: 'Bulleted Lists with <ul> and <li>',
    shortLesson:
      'To list items, wrap them in an unordered list container <ul>. Inside, wrap each item in a list item tag <li>.',
    objective: 'Create an unordered list containing two items: "HTML" and "CSS".',
    instructions: 'Write a <ul> containing an <li> with "HTML" and an <li> with "CSS".',
    requiredConcepts: ['html', 'list', 'ul', 'li'],
    languages: ['html'],
    starterCode: '<!-- Create your bulleted list below -->\n',
    expectedResult: '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n</ul>',
    hints: [
      'Clue: <ul> opens the list, and each item is wrapped in <li> and </li>.',
      'Concept: <ul><li>HTML</li><li>CSS</li></ul>',
      'Example: <ul><li>First</li><li>Second</li></ul>',
    ],
    fullSolutionCode: '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n</ul>',
    xpReward: 50,
    summaryLearned: 'You learned how to create structured bulleted lists using <ul> and <li>.',
    tagsTaught: ['ul', 'li'],
    conceptKey: 'list',
    validate: (code: string | MissionCode): ValidationResult => {
      const doc = parseHtmlDoc(code);
      const ul = doc.querySelector('ul');
      const items = Array.from(doc.querySelectorAll('li'));
      if (!ul) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_element',
          message: 'Missing the <ul> container.',
          friendlyExplanation: 'Wrap your list items inside <ul> and </ul>.',
          hint: '<ul><li>HTML</li><li>CSS</li></ul>',
          conceptKey: 'list',
        };
      }
      if (items.length < 2) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_element',
          message: 'You need two <li> items.',
          friendlyExplanation: 'Add two list items: <li>HTML</li> and <li>CSS</li>.',
          hint: '<li>HTML</li><li>CSS</li>',
          conceptKey: 'list',
        };
      }
      const texts = items.map((i) => i.textContent?.trim().toLowerCase());
      if (!texts.includes('html') || !texts.includes('css')) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'List items must contain "HTML" and "CSS".',
          friendlyExplanation: 'Check the text of your list items: one should say "HTML" and the other "CSS".',
          hint: '<li>HTML</li> and <li>CSS</li>',
          conceptKey: 'list',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'You created a bulleted list using <ul> and <li>.',
        hint: '',
      };
    },
  }),

  // Mission 5: Add a Link
  createMission({
    id: 'm5-link',
    globalNumber: 5,
    missionIndexInSection: 5,
    sectionId: 'section-1',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Add a Link',
    subtitle: 'Connecting Pages with the <a> Anchor Tag',
    shortLesson:
      'Hyperlinks connect webpages across the internet. The <a> tag creates links using the href attribute for destination URLs: <a href="https://example.com">Visit Website</a>.',
    objective: 'Create a link that points to "https://example.com" with the text "Visit Website".',
    instructions: 'Write an <a> tag with href="https://example.com" and label "Visit Website".',
    requiredConcepts: ['html', 'link', 'href', 'anchor'],
    languages: ['html'],
    starterCode: '<!-- Create your hyperlink below -->\n',
    expectedResult: '<a href="https://example.com">Visit Website</a>',
    hints: [
      'Clue: The tag is <a> and uses the href attribute.',
      'Concept: <a href="URL">Label</a>',
      'Example: <a href="https://example.com">Visit Website</a>',
    ],
    fullSolutionCode: '<a href="https://example.com">Visit Website</a>',
    xpReward: 50,
    summaryLearned: 'You learned how to create clickable hyperlinks using <a href="...">.',
    tagsTaught: ['a', 'href'],
    conceptKey: 'link',
    validate: (code: string | MissionCode): ValidationResult => {
      const doc = parseHtmlDoc(code);
      const a = doc.querySelector('a');
      if (!a) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_element',
          message: 'Missing the <a> anchor tag.',
          friendlyExplanation: 'Create a link using <a href="...">Visit Website</a>.',
          hint: '<a href="https://example.com">Visit Website</a>',
          conceptKey: 'link',
        };
      }
      const href = a.getAttribute('href') || '';
      if (!href.includes('example.com')) {
        return {
          isCorrect: false,
          mistakeCategory: 'attribute_error',
          message: 'The link must point to "https://example.com".',
          friendlyExplanation: 'Set the href attribute: href="https://example.com"',
          hint: 'href="https://example.com"',
          conceptKey: 'link',
        };
      }
      if (a.textContent?.trim().toLowerCase() !== 'visit website') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Link text must say "Visit Website".',
          friendlyExplanation: 'Put "Visit Website" between <a> and </a>.',
          hint: '>Visit Website<',
          conceptKey: 'link',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'Hyperlink correctly created with href attribute.',
        hint: '',
      };
    },
  }),

  // Mission 6: Add an Image
  createMission({
    id: 'm6-image',
    globalNumber: 6,
    missionIndexInSection: 6,
    sectionId: 'section-1',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Add an Image',
    subtitle: 'Embedding Visual Media with <img>',
    shortLesson:
      'The <img> tag embeds pictures on a webpage. It is self-closing and uses src to specify the picture source and alt to provide accessible alternative text.',
    objective: 'Add an image with src="/logo.png" and alt="Logo".',
    instructions: 'Write an <img> tag with src="/logo.png" and alt="Logo".',
    requiredConcepts: ['html', 'image', 'src', 'alt'],
    languages: ['html'],
    starterCode: '<!-- Add your image below -->\n',
    expectedResult: '<img src="/logo.png" alt="Logo">',
    hints: [
      'Clue: <img> is self-closing and does not have a closing </img>.',
      'Concept: <img src="URL" alt="Description">',
      'Example: <img src="/logo.png" alt="Logo">',
    ],
    fullSolutionCode: '<img src="/logo.png" alt="Logo">',
    xpReward: 50,
    summaryLearned: 'You embedded an image using <img> with src and alt attributes.',
    tagsTaught: ['img', 'src', 'alt'],
    conceptKey: 'image',
    validate: (code: string | MissionCode): ValidationResult => {
      const doc = parseHtmlDoc(code);
      const img = doc.querySelector('img');
      if (!img) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_element',
          message: 'Missing the <img> element.',
          friendlyExplanation: 'Add an image using <img src="..." alt="...">.',
          hint: '<img src="/logo.png" alt="Logo">',
          conceptKey: 'image',
        };
      }
      const src = img.getAttribute('src') || '';
      if (!src.includes('logo')) {
        return {
          isCorrect: false,
          mistakeCategory: 'attribute_error',
          message: 'Image src must be "/logo.png".',
          friendlyExplanation: 'Set src="/logo.png" on your <img> tag.',
          hint: 'src="/logo.png"',
          conceptKey: 'image',
        };
      }
      const alt = img.getAttribute('alt') || '';
      if (!alt.trim()) {
        return {
          isCorrect: false,
          mistakeCategory: 'attribute_error',
          message: 'Missing the alt attribute for accessibility.',
          friendlyExplanation: 'Add alt="Logo" to your <img> tag.',
          hint: 'alt="Logo"',
          conceptKey: 'image',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'Image successfully embedded with accessible alt text.',
        hint: '',
      };
    },
  }),

  // Mission 7: Create a Box/Card
  createMission({
    id: 'm7-box-card',
    globalNumber: 7,
    missionIndexInSection: 7,
    sectionId: 'section-1',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Create a Box/Card',
    subtitle: 'Grouping Content with <div>',
    shortLesson:
      'The <div> tag is an HTML container box. It groups related elements together to form cards, sections, and layout blocks.',
    objective: 'Create a <div> container holding an <h2> saying "Card Title" and a <p> saying "Card Content".',
    instructions: 'Write a <div> containing <h2>Card Title</h2> and <p>Card Content</p>.',
    requiredConcepts: ['html', 'div', 'container', 'nesting'],
    languages: ['html'],
    starterCode: '<!-- Create your card container below -->\n',
    expectedResult: '<div>\n  <h2>Card Title</h2>\n  <p>Card Content</p>\n</div>',
    hints: [
      'Clue: Open <div>, put your heading and paragraph inside, then close </div>.',
      'Concept: <div> <h2>...</h2> <p>...</p> </div>',
      'Example: <div><h2>Title</h2><p>Content</p></div>',
    ],
    fullSolutionCode: '<div>\n  <h2>Card Title</h2>\n  <p>Card Content</p>\n</div>',
    xpReward: 50,
    summaryLearned: 'You grouped elements inside a <div> container to build card structures.',
    tagsTaught: ['div', 'h2', 'p'],
    conceptKey: 'container',
    validate: (code: string | MissionCode): ValidationResult => {
      const doc = parseHtmlDoc(code);
      const div = doc.querySelector('div');
      if (!div) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_element',
          message: 'Missing the <div> container.',
          friendlyExplanation: 'Wrap your elements inside <div> and </div>.',
          hint: '<div> ... </div>',
          conceptKey: 'container',
        };
      }
      const h2 = div.querySelector('h2');
      const p = div.querySelector('p');
      if (!h2 || h2.textContent?.trim().toLowerCase() !== 'card title') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Missing <h2>Card Title</h2> inside the <div>.',
          friendlyExplanation: 'Add <h2>Card Title</h2> inside your div.',
          hint: '<h2>Card Title</h2>',
          conceptKey: 'heading',
        };
      }
      if (!p || p.textContent?.trim().toLowerCase() !== 'card content') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Missing <p>Card Content</p> inside the <div>.',
          friendlyExplanation: 'Add <p>Card Content</p> inside your div.',
          hint: '<p>Card Content</p>',
          conceptKey: 'paragraph',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'Card container correctly assembled with <div>.',
        hint: '',
      };
    },
  }),

  // Mission 8: Build a Simple Profile
  createMission({
    id: 'm8-simple-profile',
    globalNumber: 8,
    missionIndexInSection: 8,
    sectionId: 'section-1',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Build a Simple Profile',
    subtitle: 'Assembling a Profile Component',
    shortLesson:
      'Combine your HTML foundation tags to create a real profile card: a heading for the name, a paragraph for the bio, and a button to connect!',
    objective: 'Build a profile block containing: <h1> saying "Alex", <p> saying "Web Developer", and <button> saying "Connect".',
    instructions: 'Write <h1>Alex</h1>, <p>Web Developer</p>, and <button>Connect</button>.',
    requiredConcepts: ['html', 'profile', 'synthesis'],
    languages: ['html'],
    starterCode: '<!-- Build your profile structure below -->\n',
    expectedResult: '<h1>Alex</h1>\n<p>Web Developer</p>\n<button>Connect</button>',
    hints: [
      'Clue: 3 elements in order: <h1>, <p>, and <button>.',
      'Concept: <h1>Alex</h1> <p>Web Developer</p> <button>Connect</button>',
      'Example: <h1>Name</h1><p>Job</p><button>Action</button>',
    ],
    fullSolutionCode: '<h1>Alex</h1>\n<p>Web Developer</p>\n<button>Connect</button>',
    xpReward: 75,
    summaryLearned: 'You synthesized headings, paragraphs, and buttons into a profile card.',
    tagsTaught: ['h1', 'p', 'button'],
    conceptKey: 'repetition',
    validate: (code: string | MissionCode): ValidationResult => {
      const doc = parseHtmlDoc(code);
      const h1 = doc.querySelector('h1');
      const p = doc.querySelector('p');
      const btn = doc.querySelector('button');
      if (!h1 || h1.textContent?.trim().toLowerCase() !== 'alex') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Missing <h1>Alex</h1>.',
          friendlyExplanation: 'Create <h1>Alex</h1>.',
          hint: '<h1>Alex</h1>',
          conceptKey: 'heading',
        };
      }
      if (!p || p.textContent?.trim().toLowerCase() !== 'web developer') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Missing <p>Web Developer</p>.',
          friendlyExplanation: 'Create <p>Web Developer</p>.',
          hint: '<p>Web Developer</p>',
          conceptKey: 'paragraph',
        };
      }
      if (!btn || btn.textContent?.trim().toLowerCase() !== 'connect') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Missing <button>Connect</button>.',
          friendlyExplanation: 'Create <button>Connect</button>.',
          hint: '<button>Connect</button>',
          conceptKey: 'button',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'Complete profile structure verified!',
        hint: '',
      };
    },
  }),

  // Mission 9: HTML Memory Mission
  createMission({
    id: 'm9-html-memory',
    globalNumber: 9,
    missionIndexInSection: 9,
    sectionId: 'section-1',
    type: 'memory',
    difficulty: 'EASY',
    title: 'HTML Memory Mission',
    subtitle: 'Pure Recall Protocol',
    shortLesson:
      'MEMORY RECALL: Hints and explanations are hidden! Test your memory by building core HTML elements without reference notes.',
    objective: 'Create an <h1> saying "Cyber Cadet", a <p> saying "System Online", and a <button> saying "Engage".',
    instructions: 'Without hints, write the heading, paragraph, and button from memory.',
    requiredConcepts: ['memory_recall', 'html'],
    languages: ['html'],
    starterCode: '',
    expectedResult: '<h1>Cyber Cadet</h1>\n<p>System Online</p>\n<button>Engage</button>',
    hints: [
      'Clue: Remember the tags for heading, paragraph, and clickable button.',
      'Concept: <h1>...</h1> followed by <p>...</p> followed by <button>...</button>',
      'Example: <h1>Title</h1><p>Text</p><button>Action</button>',
    ],
    fullSolutionCode: '<h1>Cyber Cadet</h1>\n<p>System Online</p>\n<button>Engage</button>',
    xpReward: 100,
    summaryLearned: 'You retained foundational HTML tags in long-term memory!',
    tagsTaught: ['h1', 'p', 'button'],
    conceptKey: 'memory_recall',
    validate: (code: string | MissionCode): ValidationResult => {
      const doc = parseHtmlDoc(code);
      const h1 = doc.querySelector('h1');
      const p = doc.querySelector('p');
      const btn = doc.querySelector('button');
      if (!h1 || h1.textContent?.trim().toLowerCase() !== 'cyber cadet') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Recall failed: Heading must say "Cyber Cadet".',
          friendlyExplanation: 'Write <h1>Cyber Cadet</h1> from memory.',
          hint: '<h1>Cyber Cadet</h1>',
          conceptKey: 'heading',
        };
      }
      if (!p || p.textContent?.trim().toLowerCase() !== 'system online') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Recall failed: Paragraph must say "System Online".',
          friendlyExplanation: 'Write <p>System Online</p> from memory.',
          hint: '<p>System Online</p>',
          conceptKey: 'paragraph',
        };
      }
      if (!btn || btn.textContent?.trim().toLowerCase() !== 'engage') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Recall failed: Button must say "Engage".',
          friendlyExplanation: 'Write <button>Engage</button> from memory.',
          hint: '<button>Engage</button>',
          conceptKey: 'button',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓ +100 XP Memory Bonus!',
        friendlyExplanation: 'Neural recall confirmed! You reconstructed the markup from memory.',
        hint: '',
      };
    },
  }),

  // Mission 10: HTML Foundation Assessment
  createMission({
    id: 'm10-html-assessment',
    globalNumber: 10,
    missionIndexInSection: 10,
    sectionId: 'section-1',
    type: 'mini_project',
    difficulty: 'MEDIUM',
    title: 'HTML Foundation Assessment',
    subtitle: 'Section 1 Capstone & Evaluation',
    shortLesson:
      'Congratulations on completing Missions 1–9! In this capstone assessment, build a full portfolio landing component using all Section 1 HTML elements.',
    objective: 'Build a portfolio containing: <h1> saying "My Portfolio", an <img> with src="/logo.png" and alt="Profile", a <p> saying "Learning to code", and a <button> saying "Hire Me".',
    instructions: 'Assemble an <h1>, an <img>, a <p>, and a <button> to finish Section 1.',
    requiredConcepts: ['html', 'assessment', 'synthesis'],
    languages: ['html'],
    starterCode: '<!-- Section 1 Capstone: Build your Portfolio -->\n',
    expectedResult: '<h1>My Portfolio</h1>\n<img src="/logo.png" alt="Profile">\n<p>Learning to code</p>\n<button>Hire Me</button>',
    hints: [
      'Clue: 4 elements: <h1>My Portfolio</h1>, <img src="/logo.png" alt="Profile">, <p>Learning to code</p>, <button>Hire Me</button>.',
      'Concept: Heading + Media + Body + Action.',
      'Example: Follow the objective order.',
    ],
    fullSolutionCode: '<h1>My Portfolio</h1>\n<img src="/logo.png" alt="Profile">\n<p>Learning to code</p>\n<button>Hire Me</button>',
    xpReward: 250,
    summaryLearned: 'You engineered a complete semantic HTML component and passed Section 1!',
    tagsTaught: ['h1', 'img', 'p', 'button'],
    conceptKey: 'mini_project',
    validate: (code: string | MissionCode): ValidationResult => {
      const doc = parseHtmlDoc(code);
      const h1 = doc.querySelector('h1');
      const img = doc.querySelector('img');
      const p = doc.querySelector('p');
      const btn = doc.querySelector('button');
      if (!h1 || h1.textContent?.trim().toLowerCase() !== 'my portfolio') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Missing <h1>My Portfolio</h1>.',
          friendlyExplanation: 'Add <h1>My Portfolio</h1>.',
          hint: '<h1>My Portfolio</h1>',
          conceptKey: 'heading',
        };
      }
      if (!img || !img.getAttribute('alt')) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_element',
          message: 'Missing <img> with an alt attribute.',
          friendlyExplanation: 'Add <img src="/logo.png" alt="Profile">.',
          hint: '<img src="/logo.png" alt="Profile">',
          conceptKey: 'image',
        };
      }
      if (!p || p.textContent?.trim().toLowerCase() !== 'learning to code') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Missing <p>Learning to code</p>.',
          friendlyExplanation: 'Add <p>Learning to code</p>.',
          hint: '<p>Learning to code</p>',
          conceptKey: 'paragraph',
        };
      }
      if (!btn || btn.textContent?.trim().toLowerCase() !== 'hire me') {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_text',
          message: 'Missing <button>Hire Me</button>.',
          friendlyExplanation: 'Add <button>Hire Me</button>.',
          hint: '<button>Hire Me</button>',
          conceptKey: 'button',
        };
      }
      return {
        isCorrect: true,
        message: 'SECTION 1 CAPSTONE COMPLETE ✓ +250 XP!',
        friendlyExplanation: 'You mastered HTML Foundation! Ready for CSS Foundation.',
        hint: '',
      };
    },
  }),

  // =========================================================================
  // SECTION 2: CSS FOUNDATION (Missions 11–20)
  // Concept: CSS controls colors, typography, sizing, spacing & layout styling.
  // =========================================================================

  // Mission 11: Change Text Color
  createMission({
    id: 'm11-text-color',
    globalNumber: 11,
    missionIndexInSection: 1,
    sectionId: 'section-2',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Change Text Color',
    subtitle: 'Visual Styling with the color Property',
    shortLesson:
      'CSS (Cascading Style Sheets) styles the look of your webpage. The color property changes text color: .title { color: red; } or .title { color: #38bdf8; }.',
    defaultLanguage: 'css',
    objective: 'In the CSS tab, change the text color of .title to red.',
    instructions: 'Inside the .title rule in the CSS tab, add color: red;.',
    requiredConcepts: ['css', 'color', 'selector'],
    languages: ['html', 'css'],
    starterCode: {
      html: '<h1 class="title">Internet Mission</h1>\n',
      css: '/* Change .title color to red below */\n.title {\n  \n}\n',
      js: '',
    },
    expectedResult: 'A .title element with text color red.',
    hints: [
      'Clue: Make sure you are in the CSS tab.',
      'Concept: In CSS, write: color: red; inside .title { }',
      'Example: .title { color: red; }',
    ],
    fullSolutionCode: {
      html: '<h1 class="title">Internet Mission</h1>',
      css: '.title {\n  color: red;\n}',
      js: '',
    },
    xpReward: 50,
    summaryLearned: 'You styled text color using the CSS color property.',
    tagsTaught: ['color'],
    conceptKey: 'css_color',
    rules: {
      elementSelector: '.title',
      styleChecks: [
        {
          selector: '.title',
          property: 'color',
          expectedValues: ['rgb(255, 0, 0)', 'red', '#ff0000'],
        },
      ],
    },
  }),

  // Mission 12: Change Background Color
  createMission({
    id: 'm12-bg-color',
    globalNumber: 12,
    missionIndexInSection: 2,
    sectionId: 'section-2',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Change Background Color',
    subtitle: 'The background-color Property',
    shortLesson:
      'The background-color property sets the background fill behind an element: .box { background-color: blue; } or .box { background-color: #0284c7; }.',
    defaultLanguage: 'css',
    objective: 'In the CSS tab, set the background-color of .box to blue.',
    instructions: 'Inside .box in the CSS tab, add background-color: blue;.',
    requiredConcepts: ['css', 'background-color'],
    languages: ['html', 'css'],
    starterCode: {
      html: '<div class="box">Styled Box</div>\n',
      css: '/* Set .box background-color to blue below */\n.box {\n  color: white;\n  padding: 16px;\n  \n}\n',
      js: '',
    },
    expectedResult: 'A .box element with blue background color.',
    hints: [
      'Clue: Use the hyphenated property name: background-color.',
      'Concept: Write background-color: blue; inside .box { }',
      'Example: .box { background-color: blue; }',
    ],
    fullSolutionCode: {
      html: '<div class="box">Styled Box</div>',
      css: '.box {\n  color: white;\n  padding: 16px;\n  background-color: blue;\n}',
      js: '',
    },
    xpReward: 50,
    summaryLearned: 'You applied a background fill color using background-color.',
    tagsTaught: ['background-color'],
    conceptKey: 'background_color',
    rules: {
      elementSelector: '.box',
      styleChecks: [
        {
          selector: '.box',
          property: 'backgroundColor',
          expectedValues: ['rgb(0, 0, 255)', 'blue', '#0000ff', 'rgb(2, 132, 199)', 'rgb(14, 165, 233)'],
        },
      ],
    },
  }),

  // Mission 13: Style Text
  createMission({
    id: 'm13-style-text',
    globalNumber: 13,
    missionIndexInSection: 3,
    sectionId: 'section-2',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Style Text',
    subtitle: 'Typography with font-size and text-align',
    shortLesson:
      'CSS controls typography. Use font-size to change text size (e.g. 24px) and text-align to position text (e.g. center, left, right).',
    defaultLanguage: 'css',
    objective: 'In the CSS tab, give .hero-text font-size: 24px and text-align: center.',
    instructions: 'Set font-size: 24px; and text-align: center; on .hero-text.',
    requiredConcepts: ['css', 'font-size', 'text-align'],
    languages: ['html', 'css'],
    starterCode: {
      html: '<p class="hero-text">Welcome to the Matrix</p>\n',
      css: '/* Style typography on .hero-text below */\n.hero-text {\n  \n}\n',
      js: '',
    },
    expectedResult: '.hero-text with font-size: 24px and centered text.',
    hints: [
      'Clue: Add two properties: font-size: 24px; and text-align: center;',
      'Concept: .hero-text { font-size: 24px; text-align: center; }',
      'Example: font-size: 24px; text-align: center;',
    ],
    fullSolutionCode: {
      html: '<p class="hero-text">Welcome to the Matrix</p>',
      css: '.hero-text {\n  font-size: 24px;\n  text-align: center;\n}',
      js: '',
    },
    xpReward: 50,
    summaryLearned: 'You scaled and centered typography using font-size and text-align.',
    tagsTaught: ['font-size', 'text-align'],
    conceptKey: 'typography',
    rules: {
      elementSelector: '.hero-text',
      styleChecks: [
        {
          selector: '.hero-text',
          property: 'fontSize',
          expectedValues: ['24px'],
        },
        {
          selector: '.hero-text',
          property: 'textAlign',
          expectedValues: ['center'],
        },
      ],
    },
  }),

  // Mission 14: Width and Height
  createMission({
    id: 'm14-width-height',
    globalNumber: 14,
    missionIndexInSection: 4,
    sectionId: 'section-2',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Width and Height',
    subtitle: 'Sizing Elements with Dimensions',
    shortLesson:
      'Control the physical dimensions of boxes and containers using width and height. For example: .card { width: 200px; height: 100px; }.',
    defaultLanguage: 'css',
    objective: 'In the CSS tab, set .badge to have width: 200px and height: 100px.',
    instructions: 'Add width: 200px; and height: 100px; to .badge.',
    requiredConcepts: ['css', 'width', 'height'],
    languages: ['html', 'css'],
    starterCode: {
      html: '<div class="badge">Sized Element</div>\n',
      css: '/* Add dimensions to .badge below */\n.badge {\n  background-color: #0284c7;\n  color: white;\n  \n}\n',
      js: '',
    },
    expectedResult: '.badge with width 200px and height 100px.',
    hints: [
      'Clue: Remember units: write 200px, not just 200.',
      'Concept: width: 200px; height: 100px;',
      'Example: .badge { width: 200px; height: 100px; }',
    ],
    fullSolutionCode: {
      html: '<div class="badge">Sized Element</div>',
      css: '.badge {\n  background-color: #0284c7;\n  color: white;\n  width: 200px;\n  height: 100px;\n}',
      js: '',
    },
    xpReward: 50,
    summaryLearned: 'You specified container dimensions using width and height.',
    tagsTaught: ['width', 'height'],
    conceptKey: 'dimensions',
    rules: {
      elementSelector: '.badge',
      styleChecks: [
        {
          selector: '.badge',
          property: 'width',
          expectedValues: ['200px'],
        },
        {
          selector: '.badge',
          property: 'height',
          expectedValues: ['100px'],
        },
      ],
    },
  }),

  // Mission 15: Margin
  createMission({
    id: 'm15-margin',
    globalNumber: 15,
    missionIndexInSection: 5,
    sectionId: 'section-2',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Margin',
    subtitle: 'Outer Spacing Between Elements',
    shortLesson:
      'Margin creates breathing room OUTSIDE an element\'s border, pushing neighboring elements away: .box { margin: 20px; }.',
    defaultLanguage: 'css',
    objective: 'In the CSS tab, give .box a margin of 20px.',
    instructions: 'Add margin: 20px; to .box in the CSS tab.',
    requiredConcepts: ['css', 'margin', 'box_model'],
    languages: ['html', 'css'],
    starterCode: {
      html: '<div class="box">Spaced Element</div>\n',
      css: '/* Add margin to .box below */\n.box {\n  background-color: #1e293b;\n  color: #38bdf8;\n  padding: 10px;\n  \n}\n',
      js: '',
    },
    expectedResult: '.box with 20px margin on all sides.',
    hints: [
      'Clue: Use margin: 20px;',
      'Concept: Margin adds space outside the element.',
      'Example: .box { margin: 20px; }',
    ],
    fullSolutionCode: {
      html: '<div class="box">Spaced Element</div>',
      css: '.box {\n  background-color: #1e293b;\n  color: #38bdf8;\n  padding: 10px;\n  margin: 20px;\n}',
      js: '',
    },
    xpReward: 50,
    summaryLearned: 'You created exterior layout spacing using the margin property.',
    tagsTaught: ['margin'],
    conceptKey: 'margin',
    rules: {
      elementSelector: '.box',
      styleChecks: [
        {
          selector: '.box',
          property: 'marginTop',
          expectedValues: ['20px'],
        },
      ],
    },
  }),

  // Mission 16: Padding
  createMission({
    id: 'm16-padding',
    globalNumber: 16,
    missionIndexInSection: 6,
    sectionId: 'section-2',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Padding',
    subtitle: 'Inner Spacing Inside Elements',
    shortLesson:
      'Padding creates space INSIDE an element\'s border, keeping text and content from touching the edges: .card { padding: 16px; }.',
    defaultLanguage: 'css',
    objective: 'In the CSS tab, give .card a padding of 16px.',
    instructions: 'Add padding: 16px; to .card in the CSS tab.',
    requiredConcepts: ['css', 'padding', 'box_model'],
    languages: ['html', 'css'],
    starterCode: {
      html: '<div class="card">Card with Breathing Room</div>\n',
      css: '/* Add padding to .card below */\n.card {\n  background-color: #0f172a;\n  color: white;\n  \n}\n',
      js: '',
    },
    expectedResult: '.card with 16px padding on all sides.',
    hints: [
      'Clue: Use padding: 16px;',
      'Concept: Padding adds space inside the element.',
      'Example: .card { padding: 16px; }',
    ],
    fullSolutionCode: {
      html: '<div class="card">Card with Breathing Room</div>',
      css: '.card {\n  background-color: #0f172a;\n  color: white;\n  padding: 16px;\n}',
      js: '',
    },
    xpReward: 50,
    summaryLearned: 'You created interior breathing space using the padding property.',
    tagsTaught: ['padding'],
    conceptKey: 'padding',
    rules: {
      elementSelector: '.card',
      styleChecks: [
        {
          selector: '.card',
          property: 'paddingTop',
          expectedValues: ['16px'],
        },
      ],
    },
  }),

  // Mission 17: Border
  createMission({
    id: 'm17-border',
    globalNumber: 17,
    missionIndexInSection: 7,
    sectionId: 'section-2',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Border',
    subtitle: 'Outlines with Width, Style & Color',
    shortLesson:
      'The border shorthand property sets width, style, and color: .panel { border: 2px solid cyan; } or border: 1px solid white;.',
    defaultLanguage: 'css',
    objective: 'In the CSS tab, give .panel a border: 2px solid cyan.',
    instructions: 'Add border: 2px solid cyan; to .panel.',
    requiredConcepts: ['css', 'border'],
    languages: ['html', 'css'],
    starterCode: {
      html: '<div class="panel">Outlined Panel</div>\n',
      css: '/* Add a border to .panel below */\n.panel {\n  padding: 12px;\n  background-color: #0f172a;\n  color: white;\n  \n}\n',
      js: '',
    },
    expectedResult: '.panel with a 2px solid cyan border.',
    hints: [
      'Clue: Border requires width, style, and color in one line.',
      'Concept: border: 2px solid cyan;',
      'Example: .panel { border: 2px solid cyan; }',
    ],
    fullSolutionCode: {
      html: '<div class="panel">Outlined Panel</div>',
      css: '.panel {\n  padding: 12px;\n  background-color: #0f172a;\n  color: white;\n  border: 2px solid cyan;\n}',
      js: '',
    },
    xpReward: 50,
    summaryLearned: 'You framed an element with a custom border.',
    tagsTaught: ['border'],
    conceptKey: 'border',
    rules: {
      elementSelector: '.panel',
      styleChecks: [
        {
          selector: '.panel',
          property: 'borderWidth',
          expectedValues: ['2px'],
        },
        {
          selector: '.panel',
          property: 'borderStyle',
          expectedValues: ['solid'],
        },
      ],
    },
  }),

  // Mission 18: Border Radius
  createMission({
    id: 'm18-border-radius',
    globalNumber: 18,
    missionIndexInSection: 8,
    sectionId: 'section-2',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Border Radius',
    subtitle: 'Smooth Rounded Corners with border-radius',
    shortLesson:
      'Modern web designs use border-radius to curve sharp corners into smooth rounded edges: .button { border-radius: 12px; } or 50% for circles!',
    defaultLanguage: 'css',
    objective: 'In the CSS tab, give .button a border-radius: 12px.',
    instructions: 'Add border-radius: 12px; to .button.',
    requiredConcepts: ['css', 'border-radius'],
    languages: ['html', 'css'],
    starterCode: {
      html: '<button class="button">Rounded Button</button>\n',
      css: '/* Round the corners of .button below */\n.button {\n  background-color: #06b6d4;\n  color: #020617;\n  padding: 10px 20px;\n  border: none;\n  \n}\n',
      js: '',
    },
    expectedResult: '.button with 12px rounded corners.',
    hints: [
      'Clue: Use the hyphenated property border-radius.',
      'Concept: border-radius: 12px;',
      'Example: .button { border-radius: 12px; }',
    ],
    fullSolutionCode: {
      html: '<button class="button">Rounded Button</button>',
      css: '.button {\n  background-color: #06b6d4;\n  color: #020617;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 12px;\n}',
      js: '',
    },
    xpReward: 50,
    summaryLearned: 'You rounded sharp element corners using border-radius.',
    tagsTaught: ['border-radius'],
    conceptKey: 'border_radius',
    rules: {
      elementSelector: '.button',
      styleChecks: [
        {
          selector: '.button',
          property: 'borderRadius',
          expectedValues: ['12px'],
        },
      ],
    },
  }),

  // Mission 19: Build a Styled Card
  createMission({
    id: 'm19-build-styled-card',
    globalNumber: 19,
    missionIndexInSection: 9,
    sectionId: 'section-2',
    type: 'normal',
    difficulty: 'MEDIUM',
    title: 'Build a Styled Card',
    subtitle: 'Synthesis: Color, Padding, Border & Radius',
    shortLesson:
      'Assemble all your CSS skills into a finished component: style .card with background-color: #0f172a, color: white, padding: 16px, and border-radius: 12px!',
    defaultLanguage: 'css',
    objective: 'In the CSS tab, style .card with background-color: #0f172a, color: white, padding: 16px, and border-radius: 12px.',
    instructions: 'Set background-color, color, padding, and border-radius on .card.',
    requiredConcepts: ['css', 'card', 'synthesis'],
    languages: ['html', 'css'],
    starterCode: {
      html: '<div class="card">\n  <h2>Cyber Card</h2>\n  <p>Engineered with CSS.</p>\n</div>\n',
      css: '/* Assemble your styled card below */\n.card {\n  \n}\n',
      js: '',
    },
    expectedResult: '.card styled with background, padding, color, and rounded corners.',
    hints: [
      'Clue: Add background-color: #0f172a; color: white; padding: 16px; border-radius: 12px;',
      'Concept: Combine color, padding, and border-radius properties.',
      'Example: .card { background-color: #0f172a; color: white; padding: 16px; border-radius: 12px; }',
    ],
    fullSolutionCode: {
      html: '<div class="card">\n  <h2>Cyber Card</h2>\n  <p>Engineered with CSS.</p>\n</div>',
      css: '.card {\n  background-color: #0f172a;\n  color: white;\n  padding: 16px;\n  border-radius: 12px;\n}',
      js: '',
    },
    xpReward: 75,
    summaryLearned: 'You styled a modern card component unifying background, padding, and border radius.',
    tagsTaught: ['card', 'padding', 'border-radius'],
    conceptKey: 'card_synthesis',
    rules: {
      elementSelector: '.card',
      styleChecks: [
        {
          selector: '.card',
          property: 'paddingTop',
          expectedValues: ['16px'],
        },
        {
          selector: '.card',
          property: 'borderRadius',
          expectedValues: ['12px'],
        },
      ],
    },
  }),

  // Mission 20: CSS Foundation Assessment
  createMission({
    id: 'm20-css-assessment',
    globalNumber: 20,
    missionIndexInSection: 10,
    sectionId: 'section-2',
    type: 'mini_project',
    difficulty: 'MEDIUM',
    title: 'CSS Foundation Assessment',
    subtitle: 'Section 2 Capstone & Evaluation',
    shortLesson:
      'Prove your CSS mastery! In this capstone, style the complete .profile-card component with background-color: #0f172a, color: white, padding: 20px, and border-radius: 16px.',
    defaultLanguage: 'css',
    objective: 'In the CSS tab, style .profile-card with background-color: #0f172a, color: white, padding: 20px, and border-radius: 16px.',
    instructions: 'Add background-color, color, padding, and border-radius to .profile-card.',
    requiredConcepts: ['css', 'assessment', 'box_model'],
    languages: ['html', 'css'],
    starterCode: {
      html: '<div class="profile-card">\n  <h2>Alex Developer</h2>\n  <p>Ready for JavaScript!</p>\n</div>\n',
      css: '/* Section 2 Capstone: Style .profile-card */\n.profile-card {\n  \n}\n',
      js: '',
    },
    expectedResult: '.profile-card with 20px padding, 16px border-radius, and dark background.',
    hints: [
      'Clue: .profile-card { background-color: #0f172a; color: white; padding: 20px; border-radius: 16px; }',
      'Concept: Background + Color + Padding + Border Radius.',
      'Example: Follow the objective order.',
    ],
    fullSolutionCode: {
      html: '<div class="profile-card">\n  <h2>Alex Developer</h2>\n  <p>Ready for JavaScript!</p>\n</div>',
      css: '.profile-card {\n  background-color: #0f172a;\n  color: white;\n  padding: 20px;\n  border-radius: 16px;\n}',
      js: '',
    },
    xpReward: 250,
    summaryLearned: 'You completed the CSS Foundation Section and unlocked JavaScript Foundation!',
    tagsTaught: ['css', 'assessment'],
    conceptKey: 'mini_project',
    rules: {
      elementSelector: '.profile-card',
      styleChecks: [
        {
          selector: '.profile-card',
          property: 'paddingTop',
          expectedValues: ['20px'],
        },
        {
          selector: '.profile-card',
          property: 'borderRadius',
          expectedValues: ['16px'],
        },
      ],
    },
  }),

  // =========================================================================
  // SECTION 3: JAVASCRIPT FOUNDATION (Missions 21–30)
  // Concept: JavaScript brings webpages to life with variables, clicks, DOM & state.
  // =========================================================================

  // Mission 21: JavaScript Introduction
  createMission({
    id: 'm21-js-intro',
    globalNumber: 21,
    missionIndexInSection: 1,
    sectionId: 'section-3',
    type: 'normal',
    difficulty: 'EASY',
    title: 'JavaScript Introduction',
    subtitle: 'The Web\'s Brain & console.log',
    shortLesson:
      'Welcome to JavaScript! While HTML creates structure and CSS provides styling, JavaScript provides the BRAIN. console.log("System Online"); prints output to test code.',
    defaultLanguage: 'javascript',
    objective: 'In the JAVASCRIPT tab, write: console.log("System Online");',
    instructions: 'Type console.log("System Online"); into the JavaScript editor.',
    requiredConcepts: ['javascript', 'console.log'],
    languages: ['html', 'javascript'],
    starterCode: {
      html: '<p>JavaScript runs behind the scenes. Check console output!</p>\n',
      css: '',
      js: '// Write console.log("System Online"); below\n',
    },
    expectedResult: 'console.log("System Online"); executed.',
    hints: [
      'Clue: Make sure you are in the JAVASCRIPT tab.',
      'Concept: console.log("System Online");',
      'Example: console.log("System Online");',
    ],
    fullSolutionCode: {
      html: '<p>JavaScript runs behind the scenes. Check console output!</p>',
      css: '',
      js: 'console.log("System Online");',
    },
    xpReward: 50,
    summaryLearned: 'You wrote your first JavaScript command using console.log.',
    tagsTaught: ['console.log'],
    conceptKey: 'js_intro',
    validate: (code: string | MissionCode): ValidationResult => {
      const jsCode = typeof code === 'string' ? '' : code?.js || '';
      if (!jsCode.includes('console.log') || !jsCode.toLowerCase().includes('system online')) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_js_syntax',
          message: 'Missing console.log("System Online");.',
          friendlyExplanation: 'Write console.log("System Online"); in the JAVASCRIPT tab.',
          hint: 'console.log("System Online");',
          conceptKey: 'js_intro',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'First JavaScript command successfully logged!',
        hint: '',
      };
    },
  }),

  // Mission 22: Variables
  createMission({
    id: 'm22-variables',
    globalNumber: 22,
    missionIndexInSection: 2,
    sectionId: 'section-3',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Variables',
    subtitle: 'Storing Data with const and let',
    shortLesson:
      'Variables store values in computer memory. Use const for values that stay constant: const username = "CyberCadet";.',
    defaultLanguage: 'javascript',
    objective: 'In the JAVASCRIPT tab, declare a variable: const username = "CyberCadet";',
    instructions: 'Type const username = "CyberCadet"; into the editor.',
    requiredConcepts: ['javascript', 'variables', 'const'],
    languages: ['html', 'javascript'],
    starterCode: {
      html: '<p>Variables hold data in memory.</p>\n',
      css: '',
      js: '// Declare const username = "CyberCadet"; below\n',
    },
    expectedResult: 'A const variable named username with value "CyberCadet".',
    hints: [
      'Clue: Use the const keyword followed by username = "CyberCadet";',
      'Concept: const username = "CyberCadet";',
      'Example: const username = "CyberCadet";',
    ],
    fullSolutionCode: {
      html: '<p>Variables hold data in memory.</p>',
      css: '',
      js: 'const username = "CyberCadet";',
    },
    xpReward: 50,
    summaryLearned: 'You learned to store values in memory using const variables.',
    tagsTaught: ['const', 'variables'],
    conceptKey: 'variables',
    validate: (code: string | MissionCode): ValidationResult => {
      const jsCode = typeof code === 'string' ? '' : code?.js || '';
      if (!jsCode.includes('username') || !jsCode.includes('CyberCadet')) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_js_syntax',
          message: 'Missing const username = "CyberCadet";.',
          friendlyExplanation: 'Declare a const variable named username equal to "CyberCadet".',
          hint: 'const username = "CyberCadet";',
          conceptKey: 'variables',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'Variable declared and stored in memory!',
        hint: '',
      };
    },
  }),

  // Mission 23: Button Click
  createMission({
    id: 'm23-button-click',
    globalNumber: 23,
    missionIndexInSection: 3,
    sectionId: 'section-3',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Button Click',
    subtitle: 'Listening for Events with addEventListener',
    shortLesson:
      'Webpages react to user actions through event listeners. We tell the button to listen for clicks: btn.addEventListener("click", () => { ... });.',
    defaultLanguage: 'javascript',
    objective: 'In the JAVASCRIPT tab, add a click event listener to btn that calls console.log("Clicked!");',
    instructions: 'Write btn.addEventListener("click", () => { console.log("Clicked!"); });.',
    requiredConcepts: ['javascript', 'event_listener', 'click'],
    languages: ['html', 'javascript'],
    starterCode: {
      html: '<button id="btn">Click Me</button>\n',
      css: '',
      js: 'const btn = document.getElementById("btn");\n\n// Add click event listener to btn below\n',
    },
    expectedResult: 'A click listener attached to #btn logging "Clicked!".',
    hints: [
      'Clue: Use btn.addEventListener("click", () => { console.log("Clicked!"); });',
      'Concept: addEventListener waits for user clicks.',
      'Example: btn.addEventListener("click", () => { console.log("Clicked!"); });',
    ],
    fullSolutionCode: {
      html: '<button id="btn">Click Me</button>',
      css: '',
      js: 'const btn = document.getElementById("btn");\nbtn.addEventListener("click", () => {\n  console.log("Clicked!");\n});',
    },
    xpReward: 50,
    summaryLearned: 'You registered a click event listener with addEventListener.',
    tagsTaught: ['addEventListener', 'click'],
    conceptKey: 'event_listener',
    validate: (code: string | MissionCode): ValidationResult => {
      const jsCode = typeof code === 'string' ? '' : code?.js || '';
      if (!jsCode.includes('addEventListener') || !jsCode.includes('click')) {
        return {
          isCorrect: false,
          mistakeCategory: 'missing_event_listener',
          message: 'Missing btn.addEventListener("click", ...);',
          friendlyExplanation: 'Add a click event listener to btn.',
          hint: 'btn.addEventListener("click", () => { ... });',
          conceptKey: 'event_listener',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'Click event listener attached to button!',
        hint: '',
      };
    },
  }),

  // Mission 24: Change Text
  createMission({
    id: 'm24-change-text',
    globalNumber: 24,
    missionIndexInSection: 4,
    sectionId: 'section-3',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Change Text',
    subtitle: 'Updating Webpages with .textContent',
    shortLesson:
      'The .textContent property changes the text inside an HTML element dynamically: msg.textContent = "Hello World";.',
    defaultLanguage: 'javascript',
    objective: 'When btn is clicked, change msg.textContent to "Hello World".',
    instructions: 'Inside the click listener in the JAVASCRIPT tab, write: msg.textContent = "Hello World";.',
    requiredConcepts: ['javascript', 'textContent', 'dom_mutation'],
    languages: ['html', 'javascript'],
    starterCode: {
      html: '<button id="btn">Update Text</button>\n<p id="msg">Original Text</p>\n',
      css: '',
      js: `const btn = document.getElementById("btn");
const msg = document.getElementById("msg");

btn.addEventListener("click", () => {
  // Change msg.textContent to "Hello World" below
  
});
`,
    },
    expectedResult: 'Clicking the button updates #msg to say "Hello World".',
    hints: [
      'Clue: Write msg.textContent = "Hello World"; inside the curly braces { }.',
      'Concept: .textContent updates text on the screen.',
      'Example: msg.textContent = "Hello World";',
    ],
    fullSolutionCode: {
      html: '<button id="btn">Update Text</button>\n<p id="msg">Original Text</p>',
      css: '',
      js: `const btn = document.getElementById("btn");
const msg = document.getElementById("msg");

btn.addEventListener("click", () => {
  msg.textContent = "Hello World";
});`,
    },
    xpReward: 50,
    summaryLearned: 'You updated webpage text dynamically using .textContent.',
    tagsTaught: ['textContent'],
    conceptKey: 'text_content',
    validate: (code: string | MissionCode): ValidationResult => {
      const jsCode = typeof code === 'string' ? '' : code?.js || '';
      if (!jsCode.includes('textContent') || !jsCode.includes('Hello World')) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_js_syntax',
          message: 'Missing msg.textContent = "Hello World";',
          friendlyExplanation: 'Set msg.textContent = "Hello World"; inside the click listener.',
          hint: 'msg.textContent = "Hello World";',
          conceptKey: 'text_content',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'Live DOM text update verified!',
        hint: '',
      };
    },
  }),

  // Mission 25: Change Color
  createMission({
    id: 'm25-change-color',
    globalNumber: 25,
    missionIndexInSection: 5,
    sectionId: 'section-3',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Change Color',
    subtitle: 'Dynamic Styling with element.style',
    shortLesson:
      'JavaScript can dynamically change CSS styling using element.style: box.style.color = "yellow"; or box.style.backgroundColor = "cyan";.',
    defaultLanguage: 'javascript',
    objective: 'When btn is clicked, change box.style.color to "yellow".',
    instructions: 'Inside the click listener, write: box.style.color = "yellow";.',
    requiredConcepts: ['javascript', 'style', 'color'],
    languages: ['html', 'javascript'],
    starterCode: {
      html: '<button id="btn">Change Color</button>\n<p id="box">Text to colorize</p>\n',
      css: '',
      js: `const btn = document.getElementById("btn");
const box = document.getElementById("box");

btn.addEventListener("click", () => {
  // Change box.style.color to "yellow" below
  
});
`,
    },
    expectedResult: 'Clicking the button turns #box text color yellow.',
    hints: [
      'Clue: Use box.style.color = "yellow";',
      'Concept: element.style.property updates inline styles.',
      'Example: box.style.color = "yellow";',
    ],
    fullSolutionCode: {
      html: '<button id="btn">Change Color</button>\n<p id="box">Text to colorize</p>',
      css: '',
      js: `const btn = document.getElementById("btn");
const box = document.getElementById("box");

btn.addEventListener("click", () => {
  box.style.color = "yellow";
});`,
    },
    xpReward: 50,
    summaryLearned: 'You modified styles in real-time using element.style.',
    tagsTaught: ['style.color'],
    conceptKey: 'dynamic_style',
    validate: (code: string | MissionCode): ValidationResult => {
      const jsCode = typeof code === 'string' ? '' : code?.js || '';
      if (!jsCode.includes('style.color') || !jsCode.includes('yellow')) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_js_syntax',
          message: 'Missing box.style.color = "yellow";',
          friendlyExplanation: 'Write box.style.color = "yellow"; inside the click function.',
          hint: 'box.style.color = "yellow";',
          conceptKey: 'dynamic_style',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'Dynamic color mutation verified!',
        hint: '',
      };
    },
  }),

  // Mission 26: Show and Hide an Element
  createMission({
    id: 'm26-show-hide',
    globalNumber: 26,
    missionIndexInSection: 6,
    sectionId: 'section-3',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Show and Hide an Element',
    subtitle: 'Toggling Visibility with style.display',
    shortLesson:
      'Hide any element by setting element.style.display = "none", and restore it with element.style.display = "block".',
    defaultLanguage: 'javascript',
    objective: 'When btn is clicked, hide the secret element by setting secret.style.display = "none";',
    instructions: 'Inside the click listener, write: secret.style.display = "none";.',
    requiredConcepts: ['javascript', 'display', 'visibility'],
    languages: ['html', 'javascript'],
    starterCode: {
      html: '<button id="btn">Hide Secret</button>\n<div id="secret">This message will vanish!</div>\n',
      css: '',
      js: `const btn = document.getElementById("btn");
const secret = document.getElementById("secret");

btn.addEventListener("click", () => {
  // Hide secret below
  
});
`,
    },
    expectedResult: 'Clicking the button hides #secret.',
    hints: [
      'Clue: Use secret.style.display = "none";',
      'Concept: style.display = "none" removes the element from view.',
      'Example: secret.style.display = "none";',
    ],
    fullSolutionCode: {
      html: '<button id="btn">Hide Secret</button>\n<div id="secret">This message will vanish!</div>',
      css: '',
      js: `const btn = document.getElementById("btn");
const secret = document.getElementById("secret");

btn.addEventListener("click", () => {
  secret.style.display = "none";
});`,
    },
    xpReward: 50,
    summaryLearned: 'You controlled element visibility using style.display = "none".',
    tagsTaught: ['style.display'],
    conceptKey: 'visibility',
    validate: (code: string | MissionCode): ValidationResult => {
      const jsCode = typeof code === 'string' ? '' : code?.js || '';
      if (!jsCode.includes('style.display') || !jsCode.includes('none')) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_js_syntax',
          message: 'Missing secret.style.display = "none";',
          friendlyExplanation: 'Write secret.style.display = "none"; inside the click handler.',
          hint: 'secret.style.display = "none";',
          conceptKey: 'visibility',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'Dynamic visibility toggle verified!',
        hint: '',
      };
    },
  }),

  // Mission 27: Simple Counter
  createMission({
    id: 'm27-simple-counter',
    globalNumber: 27,
    missionIndexInSection: 7,
    sectionId: 'section-3',
    type: 'normal',
    difficulty: 'EASY',
    title: 'Simple Counter',
    subtitle: 'State Variables & Arithmetic',
    shortLesson:
      'Variables created with let can be updated and incremented! Track numbers: let count = 0; then on click: count = count + 1; and update counter.textContent = count;.',
    defaultLanguage: 'javascript',
    objective: 'Inside the click listener, increment count by 1 and display it: count = count + 1; counter.textContent = count;',
    instructions: 'Increment count and assign it to counter.textContent.',
    requiredConcepts: ['javascript', 'counter', 'arithmetic', 'state'],
    languages: ['html', 'javascript'],
    starterCode: {
      html: '<button id="btn">+1</button>\n<p>Count: <span id="counter">0</span></p>\n',
      css: '',
      js: `const btn = document.getElementById("btn");
const counter = document.getElementById("counter");
let count = 0;

btn.addEventListener("click", () => {
  // Increment count and update counter.textContent below
  
});
`,
    },
    expectedResult: 'Clicking increments count and displays it on screen.',
    hints: [
      'Clue: Write: count = count + 1; counter.textContent = count;',
      'Concept: Arithmetic updates state, then textContent renders it.',
      'Example: count = count + 1;\ncounter.textContent = count;',
    ],
    fullSolutionCode: {
      html: '<button id="btn">+1</button>\n<p>Count: <span id="counter">0</span></p>',
      css: '',
      js: `const btn = document.getElementById("btn");
const counter = document.getElementById("counter");
let count = 0;

btn.addEventListener("click", () => {
  count = count + 1;
  counter.textContent = count;
});`,
    },
    xpReward: 50,
    summaryLearned: 'You built an interactive counter managing numeric state.',
    tagsTaught: ['let', 'increment', 'state'],
    conceptKey: 'counter',
    validate: (code: string | MissionCode): ValidationResult => {
      const jsCode = typeof code === 'string' ? '' : code?.js || '';
      const hasIncrement = jsCode.includes('count++') || jsCode.includes('count = count + 1') || jsCode.includes('count += 1');
      const hasUpdate = jsCode.includes('counter.textContent');
      if (!hasIncrement || !hasUpdate) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_js_syntax',
          message: 'Increment count and update counter.textContent.',
          friendlyExplanation: 'Write count = count + 1; and counter.textContent = count; inside the click function.',
          hint: 'count = count + 1;\ncounter.textContent = count;',
          conceptKey: 'counter',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'Interactive numeric counter verified!',
        hint: '',
      };
    },
  }),

  // Mission 28: User Input
  createMission({
    id: 'm28-user-input',
    globalNumber: 28,
    missionIndexInSection: 8,
    sectionId: 'section-3',
    type: 'normal',
    difficulty: 'EASY',
    title: 'User Input',
    subtitle: 'Reading Values from <input> Fields',
    shortLesson:
      'To read what a user typed into an <input> text box, use the .value property: const name = nameInput.value; greeting.textContent = name;.',
    defaultLanguage: 'javascript',
    objective: 'When btn is clicked, set greeting.textContent to nameInput.value.',
    instructions: 'Inside the click listener, write: greeting.textContent = nameInput.value;.',
    requiredConcepts: ['javascript', 'input', 'value'],
    languages: ['html', 'javascript'],
    starterCode: {
      html: '<input id="name-input" placeholder="Type your name" value="Alex">\n<button id="btn">Greet</button>\n<p id="greeting">Waiting...</p>\n',
      css: '',
      js: `const nameInput = document.getElementById("name-input");
const btn = document.getElementById("btn");
const greeting = document.getElementById("greeting");

btn.addEventListener("click", () => {
  // Set greeting.textContent to nameInput.value below
  
});
`,
    },
    expectedResult: 'Clicking updates greeting with the value from the input box.',
    hints: [
      'Clue: Read the input with nameInput.value.',
      'Concept: greeting.textContent = nameInput.value;',
      'Example: greeting.textContent = nameInput.value;',
    ],
    fullSolutionCode: {
      html: '<input id="name-input" placeholder="Type your name" value="Alex">\n<button id="btn">Greet</button>\n<p id="greeting">Waiting...</p>',
      css: '',
      js: `const nameInput = document.getElementById("name-input");
const btn = document.getElementById("btn");
const greeting = document.getElementById("greeting");

btn.addEventListener("click", () => {
  greeting.textContent = nameInput.value;
});`,
    },
    xpReward: 50,
    summaryLearned: 'You captured live user input using input.value.',
    tagsTaught: ['input.value'],
    conceptKey: 'user_input',
    validate: (code: string | MissionCode): ValidationResult => {
      const jsCode = typeof code === 'string' ? '' : code?.js || '';
      if (!jsCode.includes('greeting.textContent') || !jsCode.includes('nameInput.value')) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_js_syntax',
          message: 'Missing greeting.textContent = nameInput.value;',
          friendlyExplanation: 'Write greeting.textContent = nameInput.value; inside the click handler.',
          hint: 'greeting.textContent = nameInput.value;',
          conceptKey: 'user_input',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓',
        friendlyExplanation: 'User input reading verified!',
        hint: '',
      };
    },
  }),

  // Mission 29: JavaScript Memory Mission
  createMission({
    id: 'm29-js-memory',
    globalNumber: 29,
    missionIndexInSection: 9,
    sectionId: 'section-3',
    type: 'memory',
    difficulty: 'EASY',
    title: 'JavaScript Memory Mission',
    subtitle: 'Pure Recall Protocol',
    shortLesson:
      'MEMORY RECALL: No hints or references! Test your recall by writing a click event listener that updates text strictly from memory.',
    defaultLanguage: 'javascript',
    objective: 'Attach a click listener to btn that changes msg.textContent to "Engaged".',
    instructions: 'Without looking at earlier lessons, write the click listener from memory.',
    requiredConcepts: ['memory_recall', 'javascript', 'event_listener'],
    languages: ['html', 'javascript'],
    starterCode: {
      html: '<button id="btn">Launch</button>\n<p id="msg">Offline</p>\n',
      css: '',
      js: `const btn = document.getElementById("btn");
const msg = document.getElementById("msg");

// Write your click event listener from memory below
`,
    },
    expectedResult: 'A click event listener updating #msg to "Engaged".',
    hints: [
      'Clue: btn.addEventListener("click", () => { msg.textContent = "Engaged"; });',
      'Concept: Reconstruct addEventListener and textContent.',
      'Example: btn.addEventListener("click", () => { msg.textContent = "Engaged"; });',
    ],
    fullSolutionCode: {
      html: '<button id="btn">Launch</button>\n<p id="msg">Offline</p>',
      css: '',
      js: `const btn = document.getElementById("btn");
const msg = document.getElementById("msg");

btn.addEventListener("click", () => {
  msg.textContent = "Engaged";
});`,
    },
    xpReward: 100,
    summaryLearned: 'You retained JavaScript event listeners and DOM manipulation in memory!',
    tagsTaught: ['addEventListener', 'textContent'],
    conceptKey: 'memory_recall',
    validate: (code: string | MissionCode): ValidationResult => {
      const jsCode = typeof code === 'string' ? '' : code?.js || '';
      if (!jsCode.includes('addEventListener') || !jsCode.includes('textContent') || !jsCode.includes('Engaged')) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_js_syntax',
          message: 'Recall failed: Attach click listener setting msg.textContent = "Engaged".',
          friendlyExplanation: 'Write btn.addEventListener("click", () => { msg.textContent = "Engaged"; }); from memory.',
          hint: 'msg.textContent = "Engaged";',
          conceptKey: 'memory_recall',
        };
      }
      return {
        isCorrect: true,
        message: 'OBJECTIVE COMPLETE ✓ +100 XP Memory Bonus!',
        friendlyExplanation: 'Neural recall confirmed! You reconstructed JavaScript logic from memory.',
        hint: '',
      };
    },
  }),

  // Mission 30: JavaScript Foundation Assessment
  createMission({
    id: 'm30-js-assessment',
    globalNumber: 30,
    missionIndexInSection: 10,
    sectionId: 'section-3',
    type: 'mini_project',
    difficulty: 'MEDIUM',
    title: 'JavaScript Foundation Assessment',
    subtitle: 'Section 3 Capstone & Evaluation',
    shortLesson:
      'Congratulations on reaching Mission 30! In this capstone, connect behavior and styling: when the button is clicked, update status.textContent to "Active" and status.style.color to "cyan".',
    defaultLanguage: 'javascript',
    objective: 'When btn is clicked, change status.textContent to "Active" and status.style.color to "cyan".',
    instructions: 'Inside the click listener, update textContent to "Active" and style.color to "cyan".',
    requiredConcepts: ['javascript', 'assessment', 'dom_mutation', 'dynamic_style'],
    languages: ['html', 'javascript'],
    starterCode: {
      html: '<button id="btn">Activate System</button>\n<p id="status">Standby</p>\n',
      css: '',
      js: `const btn = document.getElementById("btn");
const status = document.getElementById("status");

btn.addEventListener("click", () => {
  // Update status.textContent to "Active" and status.style.color to "cyan" below
  
});
`,
    },
    expectedResult: 'Clicking updates status text to "Active" and text color to "cyan".',
    hints: [
      'Clue: Inside the click function: status.textContent = "Active"; status.style.color = "cyan";',
      'Concept: Update text content and dynamic style together.',
      'Example: status.textContent = "Active";\nstatus.style.color = "cyan";',
    ],
    fullSolutionCode: {
      html: '<button id="btn">Activate System</button>\n<p id="status">Standby</p>',
      css: '',
      js: `const btn = document.getElementById("btn");
const status = document.getElementById("status");

btn.addEventListener("click", () => {
  status.textContent = "Active";
  status.style.color = "cyan";
});`,
    },
    xpReward: 250,
    summaryLearned: 'You completed the JavaScript Foundation Section and mastered frontend web pillars!',
    tagsTaught: ['javascript', 'assessment'],
    conceptKey: 'mini_project',
    validate: (code: string | MissionCode): ValidationResult => {
      const jsCode = typeof code === 'string' ? '' : code?.js || '';
      if (!jsCode.includes('textContent') || !jsCode.includes('Active') || !jsCode.includes('style.color') || !jsCode.includes('cyan')) {
        return {
          isCorrect: false,
          mistakeCategory: 'wrong_js_syntax',
          message: 'Update both status.textContent to "Active" and status.style.color to "cyan".',
          friendlyExplanation: 'Write status.textContent = "Active"; and status.style.color = "cyan"; inside the click function.',
          hint: 'status.textContent = "Active";\nstatus.style.color = "cyan";',
          conceptKey: 'mini_project',
        };
      }
      return {
        isCorrect: true,
        message: 'SECTION 3 CAPSTONE COMPLETE ✓ +250 XP!',
        friendlyExplanation: 'You mastered JavaScript Foundation! Web development trilogy complete.',
        hint: '',
      };
    },
  }),
];
