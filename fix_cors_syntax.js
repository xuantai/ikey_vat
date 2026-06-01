import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the broken tags
// Find any <img ... / crossOrigin="anonymous" referrerPolicy="no-referrer">
code = code.replace(/\/ crossOrigin="anonymous" referrerPolicy="no-referrer">/g, ' crossOrigin="anonymous" referrerPolicy="no-referrer" />');

// also what if some didn't have space
code = code.replace(/\/crossOrigin/g, ' crossOrigin');

fs.writeFileSync('src/App.tsx', code);
