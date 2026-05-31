const https = require('https');
https.get('https://dichvuthongtin.dkkd.gov.vn/inf/default.aspx?search=viettel&customsearch=1', {rejectUnauthorized:false, headers:{'User-Agent':'Mozilla/5.0'}}, (res) => {
  const cookie=res.headers['set-cookie'][0].split(';')[0];
  https.get('https://dichvuthongtin.dkkd.gov.vn/inf/default.aspx', {rejectUnauthorized:false, headers:{'User-Agent':'Mozilla/5.0', 'Cookie':cookie}}, (r2)=>{
    let d=''; r2.on('data', c=>d+=c);
    r2.on('end', ()=>{
      const lines = d.split('\n');
      lines.forEach((l, i) => {
        if (l.toLowerCase().includes('autocomplete') || l.toLowerCase().includes('ajax')) {
          console.log(i, l.trim());
        }
      });
    })
  })
})
