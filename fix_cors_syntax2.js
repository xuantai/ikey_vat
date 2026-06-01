import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace ANY instance of `/ crossOrigin` with ` crossOrigin`
// Replace ANY instance of `/ referrerPolicy` with ` referrerPolicy`
// Replace ANY instance of `">` where `"` is from previous attr, but we need to ensure `/` is at the end if it was a self-closing originally.
code = code.replace(/\/ crossOrigin/g, ' crossOrigin');
code = code.replace(/\/ referrerPolicy/g, ' referrerPolicy');

// Fix missing slashes before `>` for `<img>` tags in JSX
// Not all imgs need closing if they aren't self-closing but JSX requires self-closing for img.
code = code.replace(/<img(.*?)>/g, (match, p1) => {
  // if p1 doesn't end with `/`, add it
  if (!p1.trim().endsWith('/')) {
    return `<img${p1} />`;
  }
  return match;
});

fs.writeFileSync('src/App.tsx', code);
