async function tryFetch(name, url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8",
        ...options.headers
      }
    });
    console.log(`[${name}] Status:`, res.status, "URL:", res.url);
    const text = await res.text();
    console.log(`[${name}] Length:`, text.length);
    if (text.includes("cloudflare") || text.includes("Cloudflare") || text.includes("Attention Required") || text.includes("Turnstile") || res.status === 403) {
      console.log(`[${name}] BLOCKED OR FORBIDDEN!`);
    } else {
      console.log(`[${name}] SNIPPET:`, text.substring(0, 800).replace(/\s+/g, " "));
    }
  } catch (err) {
    console.error(`[${name}] Error:`, err.message);
  }
}

async function testAll() {
  await tryFetch("tracuu-masothue.com", "https://tracuu-masothue.com/tim-kiem?key=mowo");
  await tryFetch("thuvienphapluat.vn", "https://thuvienphapluat.vn/doanh-nghiep/tim-kiem-doanh-nghiep.aspx?key=mowo");
  await tryFetch("masothue.com", "https://masothue.com/Search/?q=mowo");
}
testAll();
