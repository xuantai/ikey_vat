process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');
const url = new URL("https://dichvuthongtin.dkkd.gov.vn/inf/default.aspx?search=losers&customsearch=1");

const req = https.get(url, (res) => {
  const cookies = res.headers['set-cookie'];
  console.log("Cookies:", cookies);
  if (res.statusCode === 307) {
    const loc = res.headers.location;
    console.log("Redirect to:", loc);
    https.get(loc, { headers: { 'Cookie': cookies.map(c => c.split(';')[0]).join('; ') } }, (res2) => {
      let data = '';
      res2.on('data', c => data += c);
      res2.on('end', () => console.log(data.length));
    });
  }
});
