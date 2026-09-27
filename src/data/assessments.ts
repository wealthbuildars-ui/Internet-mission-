import { AssessmentQuestion, SectionId } from '../types';

export const SECTION_ASSESSMENT_BANKS: Record<SectionId, AssessmentQuestion[]> = {
  // =========================================================================
  // SECTION 1: HTML FOUNDATION ASSESSMENT
  // =========================================================================
  'section-1': [
    {
      id: 's1-q1',
      sectionId: 'section-1',
      type: 'multiple_choice',
      conceptKey: 'heading',
      objective: 'Create a heading using HTML.',
      question: 'Which HTML tag creates the primary, most important heading on a webpage?',
      options: ['<header>', '<h1>', '<head>', '<title>'],
      correctOptionIndex: 1,
      explanation: 'The <h1> tag specifies the main level-1 heading. <header> is a container section, <head> stores metadata, and <title> sets the browser tab name.',
    },
    {
      id: 's1-q2',
      sectionId: 'section-1',
      type: 'identify_code',
      conceptKey: 'closing_tag',
      objective: 'Identify proper opening and closing HTML tag pairs.',
      question: 'Which of the following paragraphs is closed with valid HTML syntax?',
      options: [
        '<p>Hello world<p>',
        '<p>Hello world</p>',
        '<p>Hello world<\\p>',
        '<p>Hello world</>',
      ],
      correctOptionIndex: 1,
      explanation: 'Closing tags in standard HTML require a forward slash right after the opening angle bracket: </p>.',
    },
    {
      id: 's1-q3',
      sectionId: 'section-1',
      type: 'multiple_choice',
      conceptKey: 'button',
      objective: 'Create clickable button elements.',
      question: 'Which element is used to add a clickable action button on a webpage?',
      options: ['<click>', '<btn>', '<button>', '<action>'],
      correctOptionIndex: 2,
      explanation: 'The standard semantic HTML element for clickable buttons is <button>...</button>.',
    },
    {
      id: 's1-q4',
      sectionId: 'section-1',
      type: 'identify_code',
      conceptKey: 'list',
      objective: 'Structure bulleted lists with HTML.',
      question: 'Which code snippet produces an unordered bulleted list with two items?',
      options: [
        '<list><item>One</item><item>Two</item></list>',
        '<ul><li>One</li><li>Two</li></ul>',
        '<ol><li>One</li><li>Two</li></ol>',
        '<ul><item>One</item><item>Two</item></ul>',
      ],
      correctOptionIndex: 1,
      explanation: 'An unordered (bulleted) list uses the <ul> container with <li> (list item) elements inside.',
    },
    {
      id: 's1-q5',
      sectionId: 'section-1',
      type: 'multiple_choice',
      conceptKey: 'link',
      objective: 'Create hyperlinks with destination URLs.',
      question: 'Which attribute defines the destination address of an <a> hyperlink?',
      options: ['src', 'href', 'link', 'url'],
      correctOptionIndex: 1,
      explanation: 'The href (Hypertext REFerence) attribute specifies the target URL destination for <a> links.',
    },
    {
      id: 's1-q6',
      sectionId: 'section-1',
      type: 'multiple_choice',
      conceptKey: 'image',
      objective: 'Embed accessible images with alternative text.',
      question: 'Why is the alt attribute required on <img> elements?',
      options: [
        'It changes the color of the picture',
        'It describes the image for accessibility and when loading fails',
        'It sets the width and height automatically',
        'It turns the image into a clickable link',
      ],
      correctOptionIndex: 1,
      explanation: 'The alt attribute provides alternative text for accessibility (screen readers) and displays if image loading fails.',
    },
    {
      id: 's1-q7',
      sectionId: 'section-1',
      type: 'identify_code',
      conceptKey: 'container',
      objective: 'Group elements using container boxes.',
      question: 'Which element is used as a generic container box in HTML to group related content into cards?',
      options: ['<box>', '<group>', '<div>', '<card>'],
      correctOptionIndex: 2,
      explanation: 'The <div> (division) element is the standard container for grouping elements and building cards.',
    },
    {
      id: 's1-q8',
      sectionId: 'section-1',
      type: 'write_code',
      conceptKey: 'heading',
      objective: 'Write complete heading and button markup.',
      question: 'Create an <h1> heading saying "Launchpad" and a <button> saying "Start".',
      starterCode: '',
      explanation: 'Write: <h1>Launchpad</h1>\n<button>Start</button>',
      validateCode: (code: string) => {
        const trimmed = code.trim().toLowerCase();
        const hasH1 = trimmed.includes('<h1') && trimmed.includes('launchpad') && trimmed.includes('</h1>');
        const hasBtn = trimmed.includes('<button') && trimmed.includes('start') && trimmed.includes('</button>');
        if (hasH1 && hasBtn) {
          return { isCorrect: true, feedback: 'Excellent! Both heading and button are correctly written.' };
        }
        if (!hasH1) {
          return { isCorrect: false, feedback: 'Make sure you have <h1>Launchpad</h1>.' };
        }
        return { isCorrect: false, feedback: 'Make sure you have <button>Start</button>.' };
      },
    },
  ],

  // =========================================================================
  // SECTION 2: CSS FOUNDATION ASSESSMENT
  // =========================================================================
  'section-2': [
    {
      id: 's2-q1',
      sectionId: 'section-2',
      type: 'multiple_choice',
      conceptKey: 'css_color',
      objective: 'Distinguish text color from background color in CSS.',
      question: 'Which CSS property changes the color of text itself?',
      options: ['text-style', 'font-color', 'color', 'background-color'],
      correctOptionIndex: 2,
      explanation: 'In CSS, color controls text color, while background-color controls background fill.',
    },
    {
      id: 's2-q2',
      sectionId: 'section-2',
      type: 'multiple_choice',
      conceptKey: 'background_color',
      objective: 'Set container background colors.',
      question: 'Which CSS property sets the fill color behind an element?',
      options: ['fill', 'background-color', 'bgcolor', 'box-color'],
      correctOptionIndex: 1,
      explanation: 'background-color sets the background color of any element.',
    },
    {
      id: 's2-q3',
      sectionId: 'section-2',
      type: 'multiple_choice',
      conceptKey: 'box_model',
      objective: 'Understand padding versus margin.',
      question: 'Which CSS property generates breathing space inside an element between its content and border?',
      options: ['margin', 'padding', 'spacing', 'gap'],
      correctOptionIndex: 1,
      explanation: 'padding creates breathing room inside the border, while margin creates space outside.',
    },
    {
      id: 's2-q4',
      sectionId: 'section-2',
      type: 'multiple_choice',
      conceptKey: 'border_radius',
      objective: 'Create rounded corners on UI components.',
      question: 'Which CSS property turns sharp box corners into smooth rounded curves?',
      options: ['corner-round', 'curve', 'border-radius', 'edge-style'],
      correctOptionIndex: 2,
      explanation: 'border-radius specifies the curvature of an element\'s corners.',
    },
    {
      id: 's2-q5',
      sectionId: 'section-2',
      type: 'identify_code',
      conceptKey: 'border',
      objective: 'Specify border shorthand syntax.',
      question: 'Which CSS rule correctly sets a 2-pixel solid cyan border?',
      options: [
        'border: 2px solid cyan;',
        'border: solid 2px;',
        'border-outline: 2px cyan;',
        'stroke: 2px cyan solid;',
      ],
      correctOptionIndex: 0,
      explanation: 'The border shorthand specifies width, style, and color: border: 2px solid cyan;.',
    },
    {
      id: 's2-q6',
      sectionId: 'section-2',
      type: 'write_code',
      conceptKey: 'card_styling',
      objective: 'Write styled card CSS properties.',
      question: 'Write a CSS block for .card that sets background-color to #0f172a and padding to 16px.',
      starterCode: '.card {\n  \n}',
      explanation: '.card {\n  background-color: #0f172a;\n  padding: 16px;\n}',
      validateCode: (code: string) => {
        const trimmed = code.trim().toLowerCase();
        const hasBg = trimmed.includes('background-color') && (trimmed.includes('#0f172a') || trimmed.includes('rgb(15, 23, 42)'));
        const hasPad = trimmed.includes('padding') && trimmed.includes('16px');
        if (hasBg && hasPad) {
          return { isCorrect: true, feedback: 'Great job! Card styling properties correctly specified.' };
        }
        if (!hasBg) {
          return { isCorrect: false, feedback: 'Add background-color: #0f172a;' };
        }
        return { isCorrect: false, feedback: 'Add padding: 16px;' };
      },
    },
  ],

  // =========================================================================
  // SECTION 3: JAVASCRIPT FOUNDATION ASSESSMENT
  // =========================================================================
  'section-3': [
    {
      id: 's3-q1',
      sectionId: 'section-3',
      type: 'multiple_choice',
      conceptKey: 'role_of_js',
      objective: 'Understand the three web pillars.',
      question: 'What is the primary role of JavaScript in web development?',
      options: [
        'Defining the semantic structure of documents',
        'Styling fonts, colors, and layout borders',
        'Adding dynamic behavior, interactivity, and logic to the page',
        'Compressing image assets for faster loading',
      ],
      correctOptionIndex: 2,
      explanation: 'HTML provides structure, CSS provides visual styling, and JavaScript provides interactive behavior and logic.',
    },
    {
      id: 's3-q2',
      sectionId: 'section-3',
      type: 'multiple_choice',
      conceptKey: 'variables',
      objective: 'Declare JavaScript variables.',
      question: 'Which keyword is used to declare a variable whose value will never be reassigned?',
      options: ['var', 'let', 'const', 'fixed'],
      correctOptionIndex: 2,
      explanation: 'const creates a block-scoped constant variable that cannot be reassigned.',
    },
    {
      id: 's3-q3',
      sectionId: 'section-3',
      type: 'multiple_choice',
      conceptKey: 'event_listener',
      objective: 'Listen for user interactions.',
      question: 'Which method is standard for listening to user clicks on a button element?',
      options: [
        'btn.onClick()',
        'btn.addEventListener("click", callback)',
        'btn.listen("press")',
        'btn.attachClick()',
      ],
      correctOptionIndex: 1,
      explanation: 'addEventListener("click", callback) is the standard method for listening to events.',
    },
    {
      id: 's3-q4',
      sectionId: 'section-3',
      type: 'identify_code',
      conceptKey: 'text_content',
      objective: 'Update element text dynamically.',
      question: 'Which property updates the visible text inside an HTML element?',
      options: [
        'element.innerHTML_text = "New"',
        'element.textContent = "New"',
        'element.string = "New"',
        'element.setText("New")',
      ],
      correctOptionIndex: 1,
      explanation: '.textContent safely sets or retrieves the textual content of a node.',
    },
    {
      id: 's3-q5',
      sectionId: 'section-3',
      type: 'multiple_choice',
      conceptKey: 'visibility',
      objective: 'Toggle element visibility with style.display.',
      question: 'Which CSS display value set via JavaScript completely hides an element from the page?',
      options: ['hidden', 'invisible', 'none', 'collapse'],
      correctOptionIndex: 2,
      explanation: 'element.style.display = "none" completely removes the element from rendering.',
    },
    {
      id: 's3-q6',
      sectionId: 'section-3',
      type: 'multiple_choice',
      conceptKey: 'user_input',
      objective: 'Read user input values.',
      question: 'Which property reads what a user entered into an <input> text box?',
      options: ['input.text', 'input.value', 'input.content', 'input.data'],
      correctOptionIndex: 1,
      explanation: 'The .value property returns the current string typed into an <input> field.',
    },
    {
      id: 's3-q7',
      sectionId: 'section-3',
      type: 'write_code',
      conceptKey: 'event_listener',
      objective: 'Write a click listener that updates text.',
      question: 'Write a click listener on btn that sets msg.textContent to "Hello".',
      starterCode: 'btn.addEventListener("click", () => {\n  \n});',
      explanation: 'btn.addEventListener("click", () => {\n  msg.textContent = "Hello";\n});',
      validateCode: (code: string) => {
        const trimmed = code.trim();
        if (trimmed.includes('msg.textContent') && trimmed.includes('Hello')) {
          return { isCorrect: true, feedback: 'Perfect! Text mutation on click verified.' };
        }
        return { isCorrect: false, feedback: 'Write msg.textContent = "Hello"; inside the listener.' };
      },
    },
  ],

  // Fallbacks for any remaining section ids
  'section-4': [],
  'section-5': [],
  'section-6': [],
  'section-7': [],
};

export function getRandomAssessmentQuestions(sectionId: SectionId, count: number = 5): AssessmentQuestion[] {
  const bank = SECTION_ASSESSMENT_BANKS[sectionId] || [];
  if (bank.length <= count) return [...bank];
  // Shuffle copy
  const shuffled = [...bank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
