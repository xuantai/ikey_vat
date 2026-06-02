import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// For the bubbles inside the capture card - completely remove background logos when capturing to ensure clean layout
code = code.replace(
  /\{\/\* Beautiful dynamic ambient background layer inside the card capture container so it is captured in screenshots \*\/\}\s*<div className=\{\`absolute inset-0 pointer-events-none z-0 select-none bg-slate-50 \$\{isCapturing \? "block" : "hidden"\}\`\}>[\s\S]*?\{\/\* Profile Card Header \*\/\}/,
  `{/* Capture ambient background - Keep it completely clean without huge logos or opacities breaking on android webview */}
                <div className={\`absolute inset-0 pointer-events-none z-0 select-none bg-slate-50 \${isCapturing ? "block" : "hidden"}\`}>
                  {/* We omit any gradients or huge logos during capture because Android WebView and html-to-image lose opacity context causing 100% solid color blocks. */}
                </div>
                
                {/* Profile Card Header */}`
);

// We also should remove any width constraint on `invoice-card-to-capture` when capturing:
// The user noted that on iphone, the right margin is cut off.
// If we force w-[390px] mx-auto, and the screen is 360px, it spills. If we remove w-[390px] and just let it be w-full, it perfectly fits the device!
// Let's replace 'w-[390px] mx-auto' with 'w-full max-w-[500px] mx-auto'.
code = code.replace(
  /bg-slate-50 h-auto min-h-0 w-\[390px\] mx-auto rounded-\[33px\] flex-none shadow-none border border-slate-200\/60 pb-0 overflow-hidden/g,
  'bg-slate-50 h-[800px] min-h-max w-full mx-auto rounded-none md:rounded-[33px] flex-none shadow-none border-0 md:border md:border-slate-200/60 pb-0 overflow-hidden'
);
// Wait, if we use h-[800px], it might crop tall content. Let's use 'h-auto min-h-0 w-full mx-auto rounded-none md:rounded-[33px] flex-none shadow-none border-x-0 border-y md:border md:border-slate-200/60 pb-0 overflow-hidden'.
code = code.replace(
  /h-\[800px\] min-h-max w-full mx-auto rounded-none md:rounded-\[33px\] flex-none shadow-none border-0 md:border md:border-slate-200\/60 pb-0 overflow-hidden/g, 
  'bg-slate-50 h-auto min-h-0 w-full mx-auto rounded-none flex-none shadow-none border-0 pb-0 overflow-hidden'
);
code = code.replace(
  /bg-slate-50 h-auto min-h-0 w-\[390px\] mx-auto rounded-\[33px\] flex-none shadow-none border border-slate-200\/60 pb-0 overflow-hidden/g,
  'bg-slate-50 h-auto min-h-0 w-full mx-auto rounded-none flex-none shadow-none border-0 pb-0 overflow-hidden'
);

fs.writeFileSync('src/App.tsx', code);
