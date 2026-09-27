import { ProjectDefinition } from '../types';

export const PROJECTS: ProjectDefinition[] = [
  {
    id: 'project-1',
    title: 'Build My Profile Website',
    subtitle: 'HTML Semantic Structure & Personal CSS Styling',
    description:
      'Combine everything you learned in HTML & CSS Foundation: assemble a modern personal profile website featuring an avatar, personal bio, action button, and custom card styling.',
    difficulty: 'BEGINNER',
    xpReward: 250,
    buildWithoutHelpBonusXp: 100,
    starterCode: {
      html: `<!-- PROJECT 1: Build My Profile Website -->
<div class="profile-card">
  <!-- 1. Add your main Heading (h1) -->
  
  <!-- 2. Add an Image (img) with src and alt -->
  
  <!-- 3. Add a Paragraph (p) describing yourself -->
  
  <!-- 4. Add an action Button (button) -->
  
</div>`,
      css: `/* Style your profile website */
body {
  background-color: #0b1329;
  color: #e2e8f0;
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  padding: 24px;
}

.profile-card {
  /* Add background, padding, border-radius, border, and text-align */
  background-color: #1e293b;
  padding: 24px;
  border-radius: 16px;
  max-width: 340px;
  text-align: center;
  border: 1px solid #334155;
}`,
      js: `// Optional: Click interaction
console.log("Profile Website Loaded!");`,
    },
    hints: [
      'Use <h1> for your name, <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" alt="Avatar"> for an image.',
      'Add a <p> with a short bio, and a <button>Connect With Me</button>.',
      'In CSS, style .profile-card with padding, background-color, and border-radius for a sleek look.',
    ],
    previewMockHtml: `<div style="background:#1e293b;padding:24px;border-radius:16px;max-width:320px;margin:auto;text-align:center;color:#fff;font-family:sans-serif;">
      <h1 style="color:#38bdf8;margin:0 0 12px;">Alex Mercer</h1>
      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160" alt="Avatar" style="width:96px;height:96px;border-radius:50%;margin-bottom:12px;border:2px solid #38bdf8;object-fit:cover;">
      <p style="color:#94a3b8;font-size:14px;line-height:1.5;margin-bottom:16px;">Junior Cyber Web Developer on Internet Mission.</p>
      <button style="background:#38bdf8;color:#0f172a;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">Connect</button>
    </div>`,
    requirements: [
      {
        id: 'heading',
        label: 'Main Heading (<h1>)',
        description: 'Includes a primary <h1> heading containing your name or title.',
        check: (ctx) => {
          const h1 = ctx.getElement('h1');
          return !!h1 && (h1.textContent || '').trim().length > 0;
        },
      },
      {
        id: 'image',
        label: 'Profile Image (<img>)',
        description: 'Includes an <img> element with valid src and alt attributes.',
        check: (ctx) => {
          const img = ctx.getElement('img') as HTMLImageElement | null;
          return !!img && !!img.getAttribute('src') && !!img.getAttribute('alt');
        },
      },
      {
        id: 'paragraph',
        label: 'Bio Paragraph (<p>)',
        description: 'Includes at least one <p> paragraph describing yourself.',
        check: (ctx) => {
          const p = ctx.getElement('p');
          return !!p && (p.textContent || '').trim().length > 3;
        },
      },
      {
        id: 'button',
        label: 'Action Button (<button>)',
        description: 'Includes a <button> element with descriptive button text.',
        check: (ctx) => {
          const btn = ctx.getElement('button');
          return !!btn && (btn.textContent || '').trim().length > 0;
        },
      },
      {
        id: 'css-styling',
        label: 'Card CSS Styling',
        description: 'Styles the profile card with background color, padding, and border radius.',
        check: (ctx) => {
          const card = ctx.getElement('.profile-card') || ctx.getElement('div');
          if (!card) return false;
          const style = ctx.getComputedStyle(card.tagName.toLowerCase()) || window.getComputedStyle(card);
          const hasPadding = ctx.css.includes('padding') || (style && style.padding !== '0px');
          const hasBorderRadius = ctx.css.includes('border-radius');
          return hasPadding && (hasBorderRadius || ctx.css.includes('background'));
        },
      },
    ],
  },
  {
    id: 'project-2',
    title: 'Build a Simple Login Page',
    subtitle: 'Form Inputs, Box Model & Interactive JS Submission',
    description:
      'Build a cyber login portal! Combine inputs, labels, password fields, custom styled buttons, and JavaScript feedback when the user logs in.',
    difficulty: 'INTERMEDIATE',
    xpReward: 300,
    buildWithoutHelpBonusXp: 120,
    starterCode: {
      html: `<!-- PROJECT 2: Build a Simple Login Page -->
<div class="login-box">
  <h2>Mission Access Portal</h2>
  <p class="subtitle">Enter your agent credentials</p>

  <div class="input-group">
    <label>Username</label>
    <input type="text" id="username" placeholder="Agent codename">
  </div>

  <div class="input-group">
    <label>Password</label>
    <input type="password" id="password" placeholder="••••••••">
  </div>

  <button id="login-btn">Authenticate</button>
  <div id="status-message"></div>
</div>`,
      css: `body {
  background-color: #030712;
  color: #f8fafc;
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  margin: 0;
}

.login-box {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 28px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
}

h2 {
  margin: 0 0 6px 0;
  color: #38bdf8;
  font-size: 20px;
}

.subtitle {
  color: #94a3b8;
  font-size: 13px;
  margin: 0 0 20px 0;
}

.input-group {
  margin-bottom: 16px;
  text-align: left;
}

label {
  display: block;
  font-size: 12px;
  font-weight: bold;
  color: #cbd5e1;
  margin-bottom: 6px;
}

input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #fff;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: #0ea5e9;
  color: #030712;
  font-weight: bold;
  cursor: pointer;
  margin-top: 8px;
}

button:hover {
  background: #38bdf8;
}

#status-message {
  margin-top: 14px;
  font-size: 13px;
  min-height: 20px;
  text-align: center;
}`,
      js: `// Hook the login button to display status
const loginBtn = document.getElementById("login-btn");
const statusMsg = document.getElementById("status-message");

loginBtn.addEventListener("click", function() {
  const username = document.getElementById("username").value;
  if (username.trim() !== "") {
    statusMsg.textContent = "Welcome back, Agent " + username + "!";
    statusMsg.style.color = "#34d399";
  } else {
    statusMsg.textContent = "Please enter your agent codename.";
    statusMsg.style.color = "#f87171";
  }
});`,
    },
    hints: [
      'Ensure you have <input type="text"> and <input type="password">.',
      'Check that your button has an ID matching document.getElementById("login-btn").',
      'In JavaScript, read the username input with .value and set statusMsg.textContent.',
    ],
    requirements: [
      {
        id: 'username-input',
        label: 'Username Input (<input>)',
        description: 'Includes an input field for username.',
        check: (ctx) => {
          const input = ctx.getElement('input[type="text"]') || ctx.getElement('input:not([type="password"])');
          return !!input;
        },
      },
      {
        id: 'password-input',
        label: 'Password Input (<input type="password">)',
        description: 'Includes a secure password input field.',
        check: (ctx) => {
          const input = ctx.getElement('input[type="password"]');
          return !!input;
        },
      },
      {
        id: 'submit-button',
        label: 'Authenticate Button (<button>)',
        description: 'Includes a submit button for authentication.',
        check: (ctx) => {
          const btn = ctx.getElement('button');
          return !!btn && (btn.textContent || '').trim().length > 0;
        },
      },
      {
        id: 'status-area',
        label: 'Status Message Container',
        description: 'Includes an element (e.g. #status-message) to show login status feedback.',
        check: (ctx) => {
          return !!ctx.getElement('#status-message') || !!ctx.getElement('.status');
        },
      },
      {
        id: 'js-interactivity',
        label: 'JavaScript Event Listener',
        description: 'Adds a click event listener on the button that changes status text.',
        check: (ctx) => {
          return ctx.js.includes('addEventListener') && (ctx.js.includes('textContent') || ctx.js.includes('innerHTML'));
        },
      },
    ],
  },
  {
    id: 'project-3',
    title: 'Build a Personal Landing Page',
    subtitle: 'Hero Section, Multi-Card Grid & Semantic Footer',
    description:
      'Build a complete multi-section landing page featuring a hero showcase, call-to-action button, skill/project card grid, and a semantic footer.',
    difficulty: 'INTERMEDIATE',
    xpReward: 350,
    buildWithoutHelpBonusXp: 150,
    starterCode: {
      html: `<!-- PROJECT 3: Build a Personal Landing Page -->
<div class="page-container">
  <!-- 1. Hero Showcase -->
  <header class="hero">
    <h1>Creative Web Engineer</h1>
    <p class="tagline">Crafting futuristic web applications with code.</p>
    <button class="cta-btn" id="hero-cta">Explore My Work</button>
  </header>

  <!-- 2. Feature / Skill Cards -->
  <section class="features">
    <div class="feature-card">
      <h3>⚡ Clean HTML</h3>
      <p>Semantic tags and accessible page structure.</p>
    </div>
    <div class="feature-card">
      <h3>🎨 Modern CSS</h3>
      <p>Responsive design, vibrant palettes, and custom styling.</p>
    </div>
    <div class="feature-card">
      <h3>🚀 Fast JavaScript</h3>
      <p>Interactive DOM events and responsive user logic.</p>
    </div>
  </section>

  <!-- 3. Semantic Footer -->
  <footer class="footer">
    <p>© 2026 Internet Mission Engineer. Built with pride.</p>
  </footer>
</div>`,
      css: `body {
  background-color: #030712;
  color: #f1f5f9;
  font-family: sans-serif;
  margin: 0;
  padding: 24px;
}

.page-container {
  max-width: 640px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 32px 16px;
  background: linear-gradient(180deg, #0f172a 0%, #030712 100%);
  border-radius: 18px;
  border: 1px solid #1e293b;
  margin-bottom: 24px;
}

.hero h1 {
  color: #38bdf8;
  font-size: 28px;
  margin: 0 0 10px 0;
}

.tagline {
  color: #94a3b8;
  font-size: 15px;
  margin: 0 0 20px 0;
}

.cta-btn {
  background: #38bdf8;
  color: #030712;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.feature-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 16px;
}

.feature-card h3 {
  margin: 0 0 6px 0;
  color: #22d3ee;
  font-size: 16px;
}

.feature-card p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
}

.footer {
  text-align: center;
  padding: 16px;
  color: #64748b;
  font-size: 12px;
  border-top: 1px solid #1e293b;
}`,
      js: `const ctaBtn = document.getElementById("hero-cta");
if (ctaBtn) {
  ctaBtn.addEventListener("click", () => {
    alert("Welcome to my portfolio! Built on Internet Mission.");
  });
}`,
    },
    hints: [
      'Include a <header> with <h1> and a call to action <button>.',
      'Create at least 2 feature cards using <div> elements with a shared class.',
      'Add a <footer> at the bottom with your copyright or personal signature.',
    ],
    requirements: [
      {
        id: 'hero-section',
        label: 'Hero Section (<header> or .hero)',
        description: 'Includes a hero section with a primary title and descriptive tagline.',
        check: (ctx) => {
          const hero = ctx.getElement('header') || ctx.getElement('.hero');
          return !!hero && !!hero.querySelector('h1');
        },
      },
      {
        id: 'cta-button',
        label: 'Call to Action Button',
        description: 'Includes a prominent call to action button.',
        check: (ctx) => {
          const btn = ctx.getElement('button');
          return !!btn && (btn.textContent || '').trim().length > 0;
        },
      },
      {
        id: 'feature-cards',
        label: 'Multiple Feature / Skill Cards',
        description: 'Includes at least two cards describing skills, features, or projects.',
        check: (ctx) => {
          const cards = ctx.doc.querySelectorAll('.feature-card, .card, article');
          return cards.length >= 2;
        },
      },
      {
        id: 'semantic-footer',
        label: 'Semantic Footer (<footer>)',
        description: 'Includes a <footer> element at the bottom of the page.',
        check: (ctx) => {
          const footer = ctx.getElement('footer') || ctx.getElement('.footer');
          return !!footer && (footer.textContent || '').trim().length > 0;
        },
      },
    ],
  },
  {
    id: 'project-4',
    title: 'Build an Interactive Mini Website',
    subtitle: 'Dynamic Counters, Theme Toggles & Full Stack DOM Power',
    description:
      'Engineer a responsive interactive mini website that tracks data in real time: features state counters, dynamic style changes, and interactive buttons.',
    difficulty: 'ADVANCED',
    xpReward: 400,
    buildWithoutHelpBonusXp: 180,
    starterCode: {
      html: `<!-- PROJECT 4: Build an Interactive Mini Website -->
<div class="app-card">
  <div class="header">
    <h1>Mission Control</h1>
    <span class="badge" id="system-status">ONLINE</span>
  </div>

  <div class="display-panel">
    <span class="label">POWER LEVEL:</span>
    <span class="value" id="power-display">100</span>
  </div>

  <div class="controls">
    <button id="charge-btn">⚡ Charge (+10)</button>
    <button id="discharge-btn">🔋 Drain (-10)</button>
    <button id="toggle-theme-btn">🌓 Toggle Mode</button>
  </div>

  <div id="alert-banner" class="alert-box">System operating at nominal efficiency.</div>
</div>`,
      css: `body {
  background-color: #030712;
  color: #f8fafc;
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  margin: 0;
}

.app-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 24px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.app-card.light-mode {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
}

.app-card.light-mode h1 {
  color: #0284c7;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  font-size: 22px;
  color: #38bdf8;
  margin: 0;
}

.badge {
  background: #064e3b;
  color: #34d399;
  font-size: 11px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 6px;
}

.display-panel {
  background: #1e293b;
  border-radius: 12px;
  padding: 18px;
  text-align: center;
  margin-bottom: 20px;
}

.label {
  font-size: 12px;
  color: #94a3b8;
  display: block;
  margin-bottom: 4px;
}

.value {
  font-size: 36px;
  font-weight: bold;
  color: #38bdf8;
}

.controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

button {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #1e293b;
  color: #fff;
  font-weight: bold;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #334155;
}

#charge-btn {
  background: #0284c7;
}

#charge-btn:hover {
  background: #38bdf8;
}

.alert-box {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
  text-align: center;
  color: #cbd5e1;
}`,
      js: `let power = 100;
const powerDisplay = document.getElementById("power-display");
const chargeBtn = document.getElementById("charge-btn");
const dischargeBtn = document.getElementById("discharge-btn");
const toggleBtn = document.getElementById("toggle-theme-btn");
const appCard = document.querySelector(".app-card");
const alertBanner = document.getElementById("alert-banner");

chargeBtn.addEventListener("click", () => {
  power += 10;
  powerDisplay.textContent = power;
  alertBanner.textContent = "⚡ Power increased to " + power + "%";
});

dischargeBtn.addEventListener("click", () => {
  if (power > 0) {
    power -= 10;
    powerDisplay.textContent = power;
    alertBanner.textContent = "🔋 Power reduced to " + power + "%";
  }
});

toggleBtn.addEventListener("click", () => {
  appCard.classList.toggle("light-mode");
});`,
    },
    hints: [
      'Maintain an interactive state variable (like `power` or `count`).',
      'Use addEventListener to respond to button clicks and update the display text.',
      'Add a second button to toggle a CSS class or decrease the count.',
    ],
    requirements: [
      {
        id: 'display-container',
        label: 'Dynamic Value Display (#power-display)',
        description: 'Includes a display element showing the current state / value.',
        check: (ctx) => {
          const display = ctx.getElement('#power-display') || ctx.getElement('.value');
          return !!display && (display.textContent || '').trim().length > 0;
        },
      },
      {
        id: 'multiple-buttons',
        label: 'Multiple Interactive Buttons',
        description: 'Includes at least two distinct interactive action buttons.',
        check: (ctx) => {
          const buttons = ctx.doc.querySelectorAll('button');
          return buttons.length >= 2;
        },
      },
      {
        id: 'js-state-arithmetic',
        label: 'JavaScript State & Arithmetic',
        description: 'Updates a state counter or calculation in JavaScript.',
        check: (ctx) => {
          return ctx.js.includes('+=') || ctx.js.includes('-=') || ctx.js.includes('++') || ctx.js.includes('--');
        },
      },
      {
        id: 'js-dom-update',
        label: 'Real-time DOM Text Update',
        description: 'Updates DOM textContent dynamically on user interaction.',
        check: (ctx) => {
          return ctx.js.includes('addEventListener') && ctx.js.includes('textContent');
        },
      },
    ],
  },
];
