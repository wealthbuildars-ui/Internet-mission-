import { DailyChallenge, ValidationResult } from '../types';

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'daily-sun',
    dateKey: 'sunday',
    dayIndex: 0,
    title: 'Sunday Spotlight: High-Contrast Heading',
    category: 'HTML',
    concept: 'HTML Semantic Headings & Emphasis',
    objective: 'Create an <h1> main title containing an emphasized word with <em>.',
    instructions:
      'Write an <h1> heading for "Cyber Sunday". Inside the heading, place the word "Sunday" inside an <em> tag to emphasize it.',
    starterCode: {
      html: `<!-- Daily Challenge: Sunday Spotlight -->
<!-- Write your <h1> heading below with <em>Sunday</em> inside -->

`,
      css: `h1 {
  color: #38bdf8;
  font-family: sans-serif;
  text-align: center;
  margin-top: 40px;
}

em {
  color: #f59e0b;
  font-style: italic;
}`,
      js: ``,
    },
    xpReward: 100,
    hints: [
      'Write <h1>Cyber <em>Sunday</em></h1>.',
      'Make sure both <h1> and <em> tags are properly closed.',
      'Test your code with the Run button.',
    ],
    validate: (code, ctx) => {
      if (!ctx) return { isCorrect: false, message: 'DOM context unavailable', friendlyExplanation: '', hint: '' };
      const h1 = ctx.getElement('h1');
      if (!h1) {
        return {
          isCorrect: false,
          message: 'Missing <h1> element',
          friendlyExplanation: 'We need an <h1> heading to highlight the day.',
          hint: 'Write <h1>Cyber <em>Sunday</em></h1>',
        };
      }
      const em = h1.querySelector('em');
      if (!em || !em.textContent?.trim()) {
        return {
          isCorrect: false,
          message: 'Missing <em> inside the heading',
          friendlyExplanation: 'Place the word "Sunday" inside an <em> tag inside the <h1>.',
          hint: 'Example: <h1>Cyber <em>Sunday</em></h1>',
        };
      }
      return {
        isCorrect: true,
        message: 'Daily Challenge Complete! +100 XP Bonus Claimed.',
        friendlyExplanation: 'Great job emphasizing semantic text inside headings.',
        hint: '',
      };
    },
  },
  {
    id: 'daily-mon',
    dateKey: 'monday',
    dayIndex: 1,
    title: 'Monday Mission: The Action Call Button',
    category: 'CSS',
    concept: 'Button Styling, Padding & Border Radius',
    objective: 'Style an interactive button with a cyan background, padding, and rounded corners.',
    instructions:
      'In the HTML, create a button with id="start-btn" containing the text "Launch Mission". In CSS, style it with background-color: #06b6d4, padding: 12px 24px, and border-radius: 8px.',
    starterCode: {
      html: `<!-- Daily Challenge: Action Call Button -->
<!-- Add your <button id="start-btn">Launch Mission</button> below -->

`,
      css: `/* Add CSS rules for #start-btn */
#start-btn {
  /* Add background-color: #06b6d4 */
  /* Add padding: 12px 24px */
  /* Add border-radius: 8px */
  color: #030712;
  border: none;
  font-weight: bold;
  cursor: pointer;
}`,
      js: ``,
    },
    xpReward: 100,
    hints: [
      'Add <button id="start-btn">Launch Mission</button> in the HTML tab.',
      'In CSS, set background-color: #06b6d4; padding: 12px 24px; border-radius: 8px;.',
      'Check your element ID matches #start-btn.',
    ],
    validate: (code, ctx) => {
      if (!ctx) return { isCorrect: false, message: 'DOM context unavailable', friendlyExplanation: '', hint: '' };
      const btn = ctx.getElement('#start-btn') || ctx.getElement('button');
      if (!btn) {
        return {
          isCorrect: false,
          message: 'Missing button element',
          friendlyExplanation: 'Add a button with id="start-btn" and text "Launch Mission".',
          hint: '<button id="start-btn">Launch Mission</button>',
        };
      }
      const hasPadding = code.css.includes('padding');
      const hasRadius = code.css.includes('border-radius');
      if (!hasPadding || !hasRadius) {
        return {
          isCorrect: false,
          message: 'Missing padding or border-radius in CSS',
          friendlyExplanation: 'Make sure your button has padding and border-radius in CSS.',
          hint: 'Add padding: 12px 24px; border-radius: 8px;',
        };
      }
      return {
        isCorrect: true,
        message: 'Daily Challenge Complete! +100 XP Bonus Claimed.',
        friendlyExplanation: 'Awesome button styling! The box model makes interfaces pop.',
        hint: '',
      };
    },
  },
  {
    id: 'daily-tue',
    dateKey: 'tuesday',
    dayIndex: 2,
    title: 'Tuesday Trigger: Click Counter',
    category: 'JavaScript',
    concept: 'Event Listeners & State Increments',
    objective: 'Create a button that increases a counter number whenever clicked.',
    instructions:
      'We have a button and a span showing a count of 0. Write a JavaScript click event listener on the button that increments the count and updates the textContent.',
    starterCode: {
      html: `<!-- Daily Challenge: Click Counter -->
<div style="text-align:center; padding: 40px; font-family: sans-serif;">
  <p style="font-size: 18px; color: #94a3b8;">Energy Level: <span id="counter" style="color: #38bdf8; font-weight: bold;">0</span></p>
  <button id="boost-btn" style="background:#0284c7; color:#fff; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">⚡ Boost Energy</button>
</div>`,
      css: `button:active {
  transform: scale(0.96);
}`,
      js: `// 1. Declare a count variable starting at 0
let count = 0;

// 2. Select the button and counter span
const btn = document.getElementById("boost-btn");
const counterDisplay = document.getElementById("counter");

// 3. Attach a click event listener
btn.addEventListener("click", () => {
  // Increment count and update counterDisplay.textContent
  count++;
  counterDisplay.textContent = count;
});`,
    },
    xpReward: 100,
    hints: [
      'Use count++ or count += 1 inside the click event listener.',
      'Update counterDisplay.textContent = count;.',
      'Click the button in the Live Preview to test it before submitting.',
    ],
    validate: (code, ctx) => {
      if (!ctx) return { isCorrect: false, message: 'DOM context unavailable', friendlyExplanation: '', hint: '' };
      const btn = ctx.getElement('#boost-btn');
      const counter = ctx.getElement('#counter');
      if (!btn || !counter) {
        return {
          isCorrect: false,
          message: 'Missing #boost-btn or #counter',
          friendlyExplanation: 'Ensure both the button and counter elements are present.',
          hint: 'Do not remove the provided HTML markup.',
        };
      }
      if (!code.js.includes('addEventListener') || !code.js.includes('click')) {
        return {
          isCorrect: false,
          message: 'Missing click event listener in JavaScript',
          friendlyExplanation: 'Use btn.addEventListener("click", () => { ... }) to handle clicks.',
          hint: 'btn.addEventListener("click", function() { ... })',
        };
      }
      if (!code.js.includes('textContent') && !code.js.includes('innerHTML')) {
        return {
          isCorrect: false,
          message: 'Missing textContent update',
          friendlyExplanation: 'Update counterDisplay.textContent with the new count value.',
          hint: 'counterDisplay.textContent = count;',
        };
      }
      return {
        isCorrect: true,
        message: 'Daily Challenge Complete! +100 XP Bonus Claimed.',
        friendlyExplanation: 'Superb! Dynamic event listeners are the heart of web applications.',
        hint: '',
      };
    },
  },
  {
    id: 'daily-wed',
    dateKey: 'wednesday',
    dayIndex: 3,
    title: 'Wednesday Web: The Quick Profile Card',
    category: 'HTML',
    concept: 'Card Composition (Heading, Paragraph, Button)',
    objective: 'Create a complete card with a heading, paragraph, and button.',
    instructions:
      'Inside a <div class="card">, create an <h2> heading with a title, a <p> with a description, and a <button> with action text.',
    starterCode: {
      html: `<!-- Daily Challenge: Quick Profile Card -->
<div class="card">
  <!-- Add an <h2> heading -->
  
  <!-- Add a <p> paragraph -->
  
  <!-- Add a <button> -->
  
</div>`,
      css: `.card {
  background-color: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
  max-width: 300px;
  margin: 30px auto;
  font-family: sans-serif;
  color: #fff;
  text-align: center;
}

h2 {
  color: #38bdf8;
  margin-top: 0;
}

p {
  color: #94a3b8;
  font-size: 14px;
}

button {
  background: #38bdf8;
  color: #030712;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}`,
      js: ``,
    },
    xpReward: 100,
    hints: [
      'Write <h2>Agent Profile</h2>.',
      'Add <p>Ready for tactical missions.</p>.',
      'Add <button>View Details</button>.',
    ],
    validate: (code, ctx) => {
      if (!ctx) return { isCorrect: false, message: 'DOM context unavailable', friendlyExplanation: '', hint: '' };
      const card = ctx.getElement('.card') || ctx.getElement('div');
      if (!card) {
        return { isCorrect: false, message: 'Missing card container <div>', friendlyExplanation: '', hint: '' };
      }
      const h2 = card.querySelector('h2') || card.querySelector('h1') || card.querySelector('h3');
      const p = card.querySelector('p');
      const btn = card.querySelector('button');
      if (!h2 || !(h2.textContent || '').trim()) {
        return {
          isCorrect: false,
          message: 'Missing heading in card',
          friendlyExplanation: 'Add an <h2> heading inside the card.',
          hint: '<h2>Agent Profile</h2>',
        };
      }
      if (!p || !(p.textContent || '').trim()) {
        return {
          isCorrect: false,
          message: 'Missing paragraph in card',
          friendlyExplanation: 'Add a <p> paragraph inside the card.',
          hint: '<p>Bio information here.</p>',
        };
      }
      if (!btn || !(btn.textContent || '').trim()) {
        return {
          isCorrect: false,
          message: 'Missing button in card',
          friendlyExplanation: 'Add a <button> element inside the card.',
          hint: '<button>Click Me</button>',
        };
      }
      return {
        isCorrect: true,
        message: 'Daily Challenge Complete! +100 XP Bonus Claimed.',
        friendlyExplanation: 'Excellent card component assembly! Clean semantic structure.',
        hint: '',
      };
    },
  },
  {
    id: 'daily-thu',
    dateKey: 'thursday',
    dayIndex: 4,
    title: 'Thursday Theme: Neon Border Glow',
    category: 'CSS',
    concept: 'Border & Box Shadow Effects',
    objective: 'Style an alert box with a solid 2px cyan border and glowing border radius.',
    instructions:
      'In CSS, style the element with class .glow-box to have border: 2px solid #00f0ff, border-radius: 12px, and padding: 20px.',
    starterCode: {
      html: `<!-- Daily Challenge: Neon Border Glow -->
<div class="glow-box">
  <h3>⚡ Quantum Alert</h3>
  <p>System operational at 100% telemetry.</p>
</div>`,
      css: `body {
  background-color: #030712;
  font-family: sans-serif;
  color: #e2e8f0;
  display: flex;
  justify-content: center;
  padding: 40px;
}

.glow-box {
  background-color: #0b1528;
  max-width: 320px;
  text-align: center;
  /* 1. Add border: 2px solid #00f0ff */
  /* 2. Add border-radius: 12px */
  /* 3. Add padding: 20px */
}

h3 {
  color: #00f0ff;
  margin-top: 0;
}

p {
  color: #94a3b8;
  font-size: 13px;
}`,
      js: ``,
    },
    xpReward: 100,
    hints: [
      'In CSS, add border: 2px solid #00f0ff; inside .glow-box.',
      'Add border-radius: 12px; to round the corners.',
      'Add padding: 20px; to create breathing room.',
    ],
    validate: (code, ctx) => {
      if (!ctx) return { isCorrect: false, message: 'DOM context unavailable', friendlyExplanation: '', hint: '' };
      const hasBorder = code.css.includes('border') && (code.css.includes('2px') || code.css.includes('#00f0ff') || code.css.includes('cyan'));
      const hasRadius = code.css.includes('border-radius');
      const hasPadding = code.css.includes('padding');
      if (!hasBorder) {
        return {
          isCorrect: false,
          message: 'Missing border property in CSS',
          friendlyExplanation: 'Add border: 2px solid #00f0ff; to .glow-box in CSS.',
          hint: 'border: 2px solid #00f0ff;',
        };
      }
      if (!hasRadius || !hasPadding) {
        return {
          isCorrect: false,
          message: 'Missing border-radius or padding',
          friendlyExplanation: 'Make sure you added border-radius: 12px; and padding: 20px;.',
          hint: 'border-radius: 12px; padding: 20px;',
        };
      }
      return {
        isCorrect: true,
        message: 'Daily Challenge Complete! +100 XP Bonus Claimed.',
        friendlyExplanation: 'Incredible glow aesthetics! Cyberpunk styling unlocked.',
        hint: '',
      };
    },
  },
  {
    id: 'daily-fri',
    dateKey: 'friday',
    dayIndex: 5,
    title: 'Friday Function: Live Input Mirror',
    category: 'JavaScript',
    concept: 'Input Values & Live Keystroke Events',
    objective: 'Display whatever the learner types into an input field live inside a greeting span.',
    instructions:
      'Listen for the "input" event on #user-input and set the textContent of #output-text to input.value.',
    starterCode: {
      html: `<!-- Daily Challenge: Live Input Mirror -->
<div style="max-width:320px; margin: 30px auto; font-family:sans-serif; text-align:center;">
  <input type="text" id="user-input" placeholder="Type your name..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #334155; background:#0f172a; color:#fff; box-sizing:border-box; margin-bottom:12px;">
  <p style="color:#94a3b8; font-size:14px;">Greetings, <span id="output-text" style="color:#38bdf8; font-weight:bold;">Agent</span>!</p>
</div>`,
      css: ``,
      js: `// Select input and output elements
const textInput = document.getElementById("user-input");
const outputText = document.getElementById("output-text");

// Listen for the "input" event
textInput.addEventListener("input", () => {
  // Update outputText with textInput.value (or fallback to 'Agent')
  if (textInput.value.trim() !== "") {
    outputText.textContent = textInput.value;
  } else {
    outputText.textContent = "Agent";
  }
});`,
    },
    xpReward: 100,
    hints: [
      'Use textInput.addEventListener("input", function() { ... }).',
      'Read textInput.value to get the current typed text.',
      'Assign it with outputText.textContent = textInput.value;.',
    ],
    validate: (code, ctx) => {
      if (!ctx) return { isCorrect: false, message: 'DOM context unavailable', friendlyExplanation: '', hint: '' };
      if (!code.js.includes('addEventListener') || !code.js.includes('.value')) {
        return {
          isCorrect: false,
          message: 'Missing input event listener or .value read',
          friendlyExplanation: 'Listen for input events and read the input value using .value.',
          hint: 'textInput.addEventListener("input", () => { outputText.textContent = textInput.value; })',
        };
      }
      return {
        isCorrect: true,
        message: 'Daily Challenge Complete! +100 XP Bonus Claimed.',
        friendlyExplanation: 'Fantastic work! You can now react to live keystrokes in real time.',
        hint: '',
      };
    },
  },
  {
    id: 'daily-sat',
    dateKey: 'saturday',
    dayIndex: 6,
    title: 'Saturday Sprint: Show & Hide Secret',
    category: 'JavaScript',
    concept: 'Toggling display Style via Click',
    objective: 'Create a button that toggles a secret message between "none" and "block".',
    instructions:
      'We have a button and a secret box. In JavaScript, add a click event listener that toggles secretBox.style.display between "none" and "block".',
    starterCode: {
      html: `<!-- Daily Challenge: Show & Hide Secret -->
<div style="text-align:center; padding:30px; font-family:sans-serif;">
  <button id="toggle-btn" style="background:#0ea5e9; color:#030712; border:none; padding:10px 18px; border-radius:8px; font-weight:bold; cursor:pointer; margin-bottom:16px;">
    👁️ Toggle Secret Message
  </button>
  <div id="secret-box" style="display:none; background:#0f172a; border:1px solid #38bdf8; border-radius:8px; padding:14px; color:#38bdf8;">
    🎉 Protocol Decrypted: You are an official Internet Mission Builder!
  </div>
</div>`,
      css: ``,
      js: `const toggleBtn = document.getElementById("toggle-btn");
const secretBox = document.getElementById("secret-box");

toggleBtn.addEventListener("click", () => {
  if (secretBox.style.display === "none") {
    secretBox.style.display = "block";
  } else {
    secretBox.style.display = "none";
  }
});`,
    },
    xpReward: 100,
    hints: [
      'Select both elements using document.getElementById.',
      'Check if secretBox.style.display === "none". If so, set it to "block".',
      'Otherwise set it back to "none".',
    ],
    validate: (code, ctx) => {
      if (!ctx) return { isCorrect: false, message: 'DOM context unavailable', friendlyExplanation: '', hint: '' };
      if (!code.js.includes('addEventListener') || !code.js.includes('style.display')) {
        return {
          isCorrect: false,
          message: 'Missing style.display toggle in JavaScript',
          friendlyExplanation: 'Use secretBox.style.display to toggle between "none" and "block".',
          hint: 'if (secretBox.style.display === "none") { secretBox.style.display = "block"; }',
        };
      }
      return {
        isCorrect: true,
        message: 'Daily Challenge Complete! +100 XP Bonus Claimed.',
        friendlyExplanation: 'Magnificent! Dynamic visibility toggling is essential for modern web UIs.',
        hint: '',
      };
    },
  },
];

export function getTodayChallenge(): DailyChallenge {
  const day = new Date().getDay(); // 0 is Sunday, 6 is Saturday
  return DAILY_CHALLENGES.find((c) => c.dayIndex === day) || DAILY_CHALLENGES[0];
}
