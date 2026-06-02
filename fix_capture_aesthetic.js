import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace these problematic classes inside the capturing card background
code = code.replace(/opacity-25 blur-\[100px\] mix-blend-multiply/g, 'opacity-[0.15] blur-3xl');
code = code.replace(/opacity-15 blur-\[80px\] mix-blend-multiply/g, 'opacity-[0.12] blur-3xl');
code = code.replace(/opacity-10 mix-blend-multiply/g, 'opacity-10');

fs.writeFileSync('src/App.tsx', code);
