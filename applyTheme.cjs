const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetFile, 'utf-8');

const replacements = [
  // Typography
  { from: /\btext-white\b/g, to: 'text-slate-900 dark:text-white' },
  { from: /\btext-slate-400\b/g, to: 'text-slate-600 dark:text-slate-400' },
  { from: /\btext-slate-200\b/g, to: 'text-slate-800 dark:text-slate-200' },
  // bg-[#050505] was present for text in some forms? No, skip text-[#050505] because it shouldn't exist in original dark.
  { from: /\btext-blue-400\b/g, to: 'text-blue-700 dark:text-blue-400' },
  { from: /\btext-emerald-400\b/g, to: 'text-emerald-700 dark:text-emerald-400' },
  { from: /\btext-amber-400\b/g, to: 'text-amber-700 dark:text-amber-400' },
  { from: /\btext-red-400\b/g, to: 'text-red-700 dark:text-red-400' },

  // Backgrounds
  { from: /\bbg-\[\#050505\]\b/g, to: 'bg-slate-50 dark:bg-[#050505]' },
  { from: /\bbg-\[\#0A192F\]\b/g, to: 'bg-slate-50 dark:bg-[#0A192F]' },
  { from: /\bbg-slate-900\/40\b/g, to: 'bg-white/80 dark:bg-slate-900/40' },
  // Wait, if I do \bbg-slate-900\b it will replace bg-slate-900/40 too if it runs after! So ordering matters.
  { from: /\bbg-slate-900(?!(\/))\b/g, to: 'bg-white dark:bg-slate-900' },
  { from: /\bbg-white\/5\b/g, to: 'bg-white dark:bg-white/5' },
  { from: /\bbg-white\/10\b/g, to: 'bg-white/90 dark:bg-white/10' },
  
  { from: /\bbg-blue-500\/10\b/g, to: 'bg-blue-50 dark:bg-blue-500/10' },
  { from: /\bbg-emerald-500\/10\b/g, to: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { from: /\bbg-amber-400\/10\b/g, to: 'bg-amber-50 dark:bg-amber-400/10' },
  { from: /\bbg-red-400\/10\b/g, to: 'bg-red-50 dark:bg-red-400/10' },

  { from: /\bfrom-transparent via-blue-500 to-transparent\b/g, to: 'from-transparent via-blue-600 dark:via-blue-500 to-transparent' },

  // Borders
  { from: /\bborder-white\/10\b/g, to: 'border-slate-200 dark:border-white/10' },
  { from: /\bborder-white\/20\b/g, to: 'border-slate-300 dark:border-white/20' },
  { from: /\bborder-white\/5\b/g, to: 'border-slate-100 dark:border-white/5' },
  { from: /\bborder-red-400\/20\b/g, to: 'border-red-200 dark:border-red-400/20' },
  { from: /\bborder-blue-500\/20\b/g, to: 'border-blue-200 dark:border-blue-500/20' },
  { from: /\bborder-emerald-500\/20\b/g, to: 'border-emerald-200 dark:border-emerald-500/20' },
  { from: /\bborder-amber-400\/20\b/g, to: 'border-amber-200 dark:border-amber-400/20' },

  // Shadows
  { from: /\bshadow-blue-500\/20\b/g, to: 'shadow-blue-500/10 dark:shadow-blue-500/20' },
  { from: /\bshadow-blue-600\/20\b/g, to: 'shadow-blue-600/10 dark:shadow-blue-600/20' },
];

replacements.forEach(r => {
  content = content.replace(r.from, r.to);
});

// Post processing for buttons that explicitly need text-white on light mode too
const buttonFixes = [
  { from: /(bg-[a-z]+-600[^"}]*)text-slate-900 dark:text-white/g, to: '$1text-white' },
];

buttonFixes.forEach(r => {
  content = content.replace(r.from, r.to);
});

fs.writeFileSync(targetFile, content);
console.log('App.tsx dual theme applied!');
