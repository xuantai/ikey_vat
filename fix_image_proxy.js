import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const helperCode = `
const proxyImageUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('https://img.vietqr.io')) return url; // Already fully CORS compliant
  if (url.startsWith('data:')) return url;
  return \`/api/proxy-image?url=\${encodeURIComponent(url)}\`;
};
`;

code = code.replace(/export const BANK_BINS: Record<string, string> = \{/, helperCode + '\nexport const BANK_BINS: Record<string, string> = {');

code = code.replace(/src=\{activeCompany\.logoUrl\}/g, "src={proxyImageUrl(activeCompany.logoUrl)}");
code = code.replace(/url\(\$\{activeCompany\.logoUrl\}\)/g, "url(${proxyImageUrl(activeCompany.logoUrl)})");
code = code.replace(/src=\{\s*activeCompany\.logoUrl\s*\}/g, "src={proxyImageUrl(activeCompany.logoUrl)}");

fs.writeFileSync('src/App.tsx', code);
