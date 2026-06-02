import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const captureCardRegex = /<div\s+id="invoice-card-to-capture"[\s\S]*?\{\/\* Profile Card Header \*\/\}/;

const captureCardReplacement = `<div 
                id="invoice-card-to-capture" 
                className={\`relative z-10 flex flex-col \${
                  isCapturing 
                    ? "bg-slate-50 h-[auto] min-h-[0] w-[390px] mx-auto rounded-[0px] flex-none shadow-none border-0 pb-0 overflow-hidden" 
                    : "w-full rounded-none md:rounded-[33px] grow min-h-full pb-0 bg-transparent"
                }\`}
              >
                
                {/* Beautiful dynamic ambient background layer inside the card capture container so it is captured in screenshots */}
                <div className={\`absolute inset-0 pointer-events-none z-0 select-none bg-slate-50 \${isCapturing ? "block" : "hidden"}\`}>
                  {activeCompany.logoUrl ? (
                    <>
                      {/* Blurred logo aesthetic bubbles */}
                      <div className="absolute top-1/4 left-1/4 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 opacity-[0.15] blur-3xl">
                        <img src={proxyImageUrl(activeCompany.logoUrl)} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-[80%] h-[80%] translate-x-1/3 translate-y-1/3 opacity-[0.12] blur-3xl">
                        <img src={proxyImageUrl(activeCompany.logoUrl)} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 opacity-40 blur-[100px]" style={{ 
                      background: \`radial-gradient(circle at 50% 50%, \${activeCompany.primaryColor}40 0%, transparent 60%),
                                   radial-gradient(circle at 80% 20%, \${activeCompany.primaryColor}30 0%, transparent 50%)\`
                    }}></div>
                  )}

                  {/* Brand logo overlay blend inside the card */}
                  {activeCompany.logoUrl && (
                    <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-10 flex items-center justify-center overflow-hidden rounded-none md:rounded-[33px]">
                      <img 
                        src={proxyImageUrl(activeCompany.logoUrl)} 
                        alt="" 
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="w-[150%] h-[150%] object-cover blur-[8px]" 
                      />
                    </div>
                  )}
                </div>
                
                {/* Profile Card Header */}`;

code = code.replace(captureCardRegex, captureCardReplacement);

fs.writeFileSync('src/App.tsx', code);
