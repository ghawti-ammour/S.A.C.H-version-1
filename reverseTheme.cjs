const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetFile, 'utf-8');

// Reverse the replacements exactly.
// Note: We need to be careful with overlaps, but we can do a straightforward string replacement for the specific classes we added.
const reverseReplacements = [
  // Specific buttons fixes that were applied last
  { from: /text-white/g, to: 'text-slate-900' }, // Temporarily revert to what it was right after the first pass

  { from: /\btext-slate-900\b/g, to: 'text-white' },
  { from: /\btext-slate-600\b/g, to: 'text-slate-400' },
  { from: /\btext-slate-800\b/g, to: 'text-slate-200' },
  // text-[#050505] was replaced by text-slate-900, which is now text-white. That's fine for now.
  { from: /\btext-blue-700\b/g, to: 'text-blue-400' },
  { from: /\btext-emerald-700\b/g, to: 'text-emerald-400' },
  { from: /\btext-amber-700\b/g, to: 'text-amber-400' },
  { from: /\btext-red-700\b/g, to: 'text-red-400' },

  { from: /\bbg-slate-50\b/g, to: 'bg-[#050505]' }, // Some were #0A192F but mostly #050505 is fine for full bg
  { from: /\bbg-white\/80\b/g, to: 'bg-slate-900/40' },
  { from: /\bbg-white\b/g, to: 'bg-white/5' }, // bg-white was replaced from bg-slate-900 and bg-white/5. 
  { from: /\bbg-white\/90\b/g, to: 'bg-white/10' },
  
  { from: /\bbg-blue-50\b/g, to: 'bg-blue-500/10' },
  { from: /\bbg-emerald-50\b/g, to: 'bg-emerald-500/10' },
  { from: /\bbg-amber-50\b/g, to: 'bg-amber-400/10' },
  { from: /\bbg-red-50\b/g, to: 'bg-red-400/10' },

  { from: /\bfrom-transparent via-blue-600 to-transparent\b/g, to: 'from-transparent via-blue-500 to-transparent' },

  { from: /\bborder-slate-200\b/g, to: 'border-white/10' },
  { from: /\bborder-slate-300\b/g, to: 'border-white/20' },
  { from: /\bborder-slate-100\b/g, to: 'border-white/5' },
  { from: /\bborder-red-200\b/g, to: 'border-red-400/20' },
  { from: /\bborder-blue-200\b/g, to: 'border-blue-500/20' },
  { from: /\bborder-emerald-200\b/g, to: 'border-emerald-500/20' },
  { from: /\bborder-amber-200\b/g, to: 'border-amber-400/20' },

  { from: /\bshadow-blue-500\/10\b/g, to: 'shadow-blue-500/20' },
  { from: /\bshadow-blue-600\/10\b/g, to: 'shadow-blue-600/20' },
  { from: /rgba\(37,99,235,0\.15\)/g, to: 'rgba(37,99,235,0.3)' },
];

reverseReplacements.forEach(r => {
  content = content.replace(r.from, r.to);
});

// We had some bg-white/5 that were originally bg-slate-900.
// Let's manually fix some known ones if necessary. We know the sidebar and big containers use glass-dark which we handle via CSS.

fs.writeFileSync(targetFile, content);
console.log('App.tsx has been reverted!');
