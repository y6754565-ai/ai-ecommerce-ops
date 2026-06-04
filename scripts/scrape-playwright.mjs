// Simple approach: use Node.js fetch with proper headers to try different Tmall endpoints
async function tryEndpoints() {
  const itemId = "742487634701";
  
  // Try multiple endpoints
  const endpoints = [
    `https://detail.tmall.com/item.htm?id=${itemId}`,
    `https://desc.alicdn.com/i4/4611686018427384952/O1CN01YLSTzs1KfzFp4bblC_!!4611686018427384952-0-rate.jpg`,
    `https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/?data=%7B%22itemNumId%22%3A%22${itemId}%22%7D`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
          "Referer": "https://www.tmall.com/",
        },
        signal: AbortSignal.timeout(10000),
      });
      const text = await res.text();
      console.log(`\n=== ${url.substring(0, 60)}... ===`);
      console.log(`Status: ${res.status}, Length: ${text.length}`);
      
      // Check if we got actual content (not login page)
      if (text.includes("itemTitle") || text.includes("title") || text.includes("price")) {
        console.log("FOUND DATA!");
        console.log(text.substring(0, 2000));
        return;
      }
    } catch (e) {
      console.log(`Failed: ${e.message}`);
    }
  }
}

tryEndpoints();
