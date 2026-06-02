import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// The main logo inside the active capturing section
code = code.replace(/className="max-w-full max-h-full object-contain mix-blend-multiply"/g, 'className={`max-w-full max-h-full object-contain ${isCapturing ? "" : "mix-blend-multiply"}`}');

// Also for VietQR
code = code.replace(/className=\{`w-full h-full mix-blend-multiply \$\{isCapturing \? 'object-contain' : 'object-contain'\}`\}/g, "className={`w-full h-full ${isCapturing ? 'object-contain' : 'mix-blend-multiply object-contain'}`}");

fs.writeFileSync('src/App.tsx', code);
