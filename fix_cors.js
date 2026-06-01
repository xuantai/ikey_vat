import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Use regex to add crossOrigin="anonymous" and referrerPolicy="no-referrer" to all <img> tags that don't have them
code = code.replace(/<img(.*?)>/g, (match, p1) => {
  let attrs = p1;
  if (!attrs.includes("crossOrigin")) {
    attrs += ' crossOrigin="anonymous"';
  }
  if (!attrs.includes("referrerPolicy")) {
    attrs += ' referrerPolicy="no-referrer"';
  }
  return `<img${attrs}>`;
});

fs.writeFileSync('src/App.tsx', code);
