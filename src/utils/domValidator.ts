import { MissionCode, MissionDOMContext, ValidationResult, MistakeCategory } from '../types';

/**
 * Normalizes code input into MissionCode object { html, css, js }
 */
export function normalizeMissionCode(
  raw: string | { html?: string; css?: string; js?: string } | undefined
): MissionCode {
  if (!raw) {
    return { html: '', css: '', js: '' };
  }

  if (typeof raw === 'string') {
    // Check if it was serialized as JSON
    if (raw.trim().startsWith('{') && raw.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
          return {
            html: typeof parsed.html === 'string' ? parsed.html : '',
            css: typeof parsed.css === 'string' ? parsed.css : '',
            js: typeof parsed.js === 'string' ? parsed.js : '',
          };
        }
      } catch {
        // Not JSON, treat as raw HTML string
      }
    }
    return { html: raw, css: '', js: '' };
  }

  return {
    html: raw.html || '',
    css: raw.css || '',
    js: raw.js || '',
  };
}

/**
 * Combines HTML, CSS, and JS into a complete sandboxed page string
 */
export function buildCombinedPage(code: MissionCode): string {
  const { html, css, js } = code;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 16px;
      line-height: 1.5;
    }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch (err) {
      console.warn("User Script Error:", err);
    }
  </script>
</body>
</html>`;
}

/**
 * Creates an isolated sandboxed DOM evaluation context to verify actual DOM,
 * computed styles, and simulate user interactions (e.g. click events).
 */
export async function createDOMContext(code: MissionCode): Promise<{
  context: MissionDOMContext;
  cleanup: () => void;
}> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(code.html, 'text/html');
  const combined = buildCombinedPage(code);

  // Create an invisible sandboxed iframe for genuine CSS style computation and JS execution testing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '800px';
  iframe.style.height = '600px';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

  document.body.appendChild(iframe);

  // Write content to iframe document
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(combined);
    iframeDoc.close();
  }

  // Small delay to let styles apply and script execute safely
  await new Promise((resolve) => setTimeout(resolve, 60));

  const win = iframe.contentWindow;
  const liveDoc = iframe.contentDocument || doc;

  const context: MissionDOMContext = {
    doc: liveDoc,
    html: code.html,
    css: code.css,
    js: code.js,
    combined,
    getElement: (selector: string) => liveDoc.querySelector(selector),
    getComputedStyle: (selector: string) => {
      const el = liveDoc.querySelector(selector);
      if (!el || !win) return null;
      return win.getComputedStyle(el);
    },
    simulateClick: async (selector: string) => {
      const el = liveDoc.querySelector(selector);
      if (!el) return false;
      if (el instanceof HTMLElement) {
        el.click();
      } else {
        const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
        el.dispatchEvent(evt);
      }
      // Give DOM time to update after click
      await new Promise((resolve) => setTimeout(resolve, 50));
      return true;
    },
    iframeWindow: win,
  };

  const cleanup = () => {
    try {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    } catch {
      // Ignored
    }
  };

  return { context, cleanup };
}

/**
 * Common mistake detector for fast, friendly diagnosis
 */
export function checkCommonMistakes(
  code: MissionCode,
  requiredLanguages: string[] = ['html']
): { category: MistakeCategory; explanation: string; hint: string } | null {
  const { html, css, js } = code;

  // 1. Empty check
  if (requiredLanguages.includes('html') && !html.trim()) {
    return {
      category: 'empty_code',
      explanation: 'The HTML code editor is empty.',
      hint: 'Type your HTML code in the HTML editor tab to begin.',
    };
  }

  // 2. Unclosed HTML tags detection
  const tagMatches = html.match(/<([a-zA-Z0-9]+)(\s[^>]*)?>/g) || [];
  const selfClosing = new Set(['img', 'br', 'hr', 'input', 'meta', 'link']);
  for (const match of tagMatches) {
    const tagName = match.replace(/^<([a-zA-Z0-9]+).*/, '$1').toLowerCase();
    if (!selfClosing.has(tagName)) {
      const closingPattern = new RegExp(`</${tagName}>`, 'i');
      if (!closingPattern.test(html)) {
        return {
          category: 'missing_closing_tag',
          explanation: `You created an opening <${tagName}> tag, but forgot to close it with </${tagName}>.`,
          hint: `Every container tag needs a matching closing tag: </${tagName}>.`,
        };
      }
    }
  }

  // 3. CSS syntax mistakes (unclosed curly braces)
  if (requiredLanguages.includes('css') && css.trim()) {
    const openBraces = (css.match(/\{/g) || []).length;
    const closeBraces = (css.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      return {
        category: 'wrong_css_property',
        explanation: 'Your CSS rules have mismatched curly braces { }.',
        hint: 'Make sure every selector has an opening { and a closing } brace.',
      };
    }
  }

  // 4. JS syntax mistakes
  if (requiredLanguages.includes('javascript') && js.trim()) {
    try {
      new Function(js);
    } catch (err: any) {
      return {
        category: 'wrong_js_syntax',
        explanation: `JavaScript syntax error: ${err.message || 'Check your parentheses, quotes, or semicolons.'}`,
        hint: 'Review your JavaScript statement syntax and ensure parentheses are closed.',
      };
    }
  }

  return null;
}
