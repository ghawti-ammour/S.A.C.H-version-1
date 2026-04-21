const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetFile, 'utf-8');

const replacements = [
  // Text Colors
  { from: /\btext-white\b/g, to: 'text-slate-900' },
  { from: /\btext-slate-400\b/g, to: 'text-slate-600' },
  { from: /\btext-slate-200\b/g, to: 'text-slate-800' },
  { from: /\btext-\[\#050505\]\b/g, to: 'text-slate-900' },
  { from: /\btext-blue-400\b/g, to: 'text-blue-700' },
  { from: /\btext-emerald-400\b/g, to: 'text-emerald-700' },
  { from: /\btext-amber-400\b/g, to: 'text-amber-700' },
  { from: /\btext-red-400\b/g, to: 'text-red-700' },

  // Background Colors
  { from: /\bbg-\[\#050505\]\b/g, to: 'bg-slate-50' },
  { from: /\bbg-\[\#0A192F\]\b/g, to: 'bg-slate-50' },
  { from: /\bbg-slate-900\/40\b/g, to: 'bg-white/80' },
  { from: /\bbg-slate-900\b/g, to: 'bg-white' },
  { from: /\bbg-white\/5\b/g, to: 'bg-white' },
  { from: /\bbg-white\/10\b/g, to: 'bg-white/90' },
  { from: /\bbg-blue-500\/10\b/g, to: 'bg-blue-50' },
  { from: /\bbg-emerald-500\/10\b/g, to: 'bg-emerald-50' },
  { from: /\bbg-amber-400\/10\b/g, to: 'bg-amber-50' },
  { from: /\bbg-red-400\/10\b/g, to: 'bg-red-50' },
  // Special backgrounds
  { from: /\bfrom-transparent via-blue-500 to-transparent\b/g, to: 'from-transparent via-blue-600 to-transparent' },

  // Border Colors
  { from: /\bborder-white\/10\b/g, to: 'border-slate-200' },
  { from: /\bborder-white\/20\b/g, to: 'border-slate-300' },
  { from: /\bborder-white\/5\b/g, to: 'border-slate-100' },
  { from: /\bborder-red-400\/20\b/g, to: 'border-red-200' },
  { from: /\bborder-blue-500\/20\b/g, to: 'border-blue-200' },
  { from: /\bborder-emerald-500\/20\b/g, to: 'border-emerald-200' },
  { from: /\bborder-amber-400\/20\b/g, to: 'border-amber-200' },

  // Shadow Colors (making them softer for light mode)
  { from: /\bshadow-blue-500\/20\b/g, to: 'shadow-blue-500/10' },
  { from: /\bshadow-blue-600\/20\b/g, to: 'shadow-blue-600/10' },
  // Keeping shadow-[0_0_50px_rgba(37,99,235,0.3)] largely similar, but drop opacity
  { from: /rgba\(37,99,235,0\.3\)/g, to: 'rgba(37,99,235,0.15)' },
  
  // Specific exceptions when text-white inside colored buttons bg-blue-600, bg-red-600, etc.
  // Wait, I am replacing ALL text-white with text-slate-900.
  // We need to restore text-white for buttons with background colors: bg-blue-600, bg-red-600, bg-emerald-600, bg-amber-600, etc.
];

// Execute replacements
replacements.forEach(r => {
  content = content.replace(r.from, r.to);
});

// Post-processing to fix buttons that SHOULD have white text
// e.g. "bg-blue-600 text-slate-900" should be "bg-blue-600 text-white"
const buttonFixes = [
  { from: /(bg-blue-600[^"}]*)text-slate-900/g, to: '$1text-white' },
  { from: /(bg-red-600[^"}]*)text-slate-900/g, to: '$1text-white' },
  { from: /(bg-emerald-600[^"}]*)text-slate-900/g, to: '$1text-white' },
  { from: /(bg-amber-600[^"}]*)text-slate-900/g, to: '$1text-white' },
  { from: /(bg-green-600[^"}]*)text-slate-900/g, to: '$1text-white' },
  // Same for hover states if they are explicitly mentioned
  { from: /(hover:bg-blue-700[^"}]*)text-slate-900/g, to: '$1text-white' },
  { from: /(bg-blue-500[^"}]*)text-slate-900/g, to: '$1text-white' },
];

buttonFixes.forEach(r => {
  content = content.replace(r.from, r.to);
});

fs.writeFileSync(targetFile, content);
console.log('App.tsx has been refactored for light mode!');
