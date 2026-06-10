const http = require('http');

http.get('http://localhost:3000/xtpro', (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  res.resume();
}).on('error', (err) => {
  console.error('ERROR:', err);
});
