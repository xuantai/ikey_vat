import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// For the bubbles inside the capture card
code = code.replace(
  /\{\/\* Blurred logo aesthetic bubbles \*\/\}\s*<div className="absolute top-1\/4 left-1\/4 w-\[120%\] h-\[120%\] -translate-x-1\/2 -translate-y-1\/2 opacity-\[0\.15\] blur-3xl">\s*<img src=\{proxyImageUrl\(activeCompany\.logoUrl\)\} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" \/>\s*<\/div>\s*<div className="absolute bottom-0 right-0 w-\[80%\] h-\[80%\] translate-x-1\/3 translate-y-1\/3 opacity-\[0\.12\] blur-3xl">\s*<img src=\{proxyImageUrl\(activeCompany\.logoUrl\)\} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" \/>\s*<\/div>/g,
  `{/* Aesthetic background */}
                      {!isCapturing ? (
                        <>
                          <div className="absolute top-1/4 left-1/4 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 opacity-[0.15] blur-3xl">
                            <img src={proxyImageUrl(activeCompany.logoUrl)} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                          </div>
                          <div className="absolute bottom-0 right-0 w-[80%] h-[80%] translate-x-1/3 translate-y-1/3 opacity-[0.12] blur-3xl">
                            <img src={proxyImageUrl(activeCompany.logoUrl)} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 opacity-10" style={{ 
                          background: \`radial-gradient(circle at 0% 0%, \${activeCompany.primaryColor}80 0%, transparent 80%),
                                       radial-gradient(circle at 100% 100%, \${activeCompany.primaryColor}80 0%, transparent 80%)\`
                        }}></div>
                      )}`
);

// We should also remove 'blur-[4px]' from the header bg image when capturing
code = code.replace(/className="absolute inset-0 opacity-\[0\.10\] bg-center bg-cover scale-125 blur-\[4px\] pointer-events-none"/g, 
  'className={`absolute inset-0 opacity-[0.10] bg-center bg-cover scale-125 pointer-events-none ${isCapturing ? "" : "blur-[4px]"}`}'
);

// We should also fix the other background fallback: blur-[100px] -> remove blur during capture for the safe radial gradient
code = code.replace(/<div className="absolute inset-0 opacity-40 blur-\[100px\]" style=\{\{/g, 
  '<div className={`absolute inset-0 opacity-40 ${isCapturing ? "" : "blur-[100px]"}`} style={{'
);

// We must remove blur-[8px] from the huge logo background block inside device
code = code.replace(/className="w-\[150%\] h-\[150%\] object-cover blur-\[8px\]"/g, 
  'className={`w-[150%] h-[150%] object-cover ${isCapturing ? "" : "blur-[8px]"}`}'
);

fs.writeFileSync('src/App.tsx', code);
