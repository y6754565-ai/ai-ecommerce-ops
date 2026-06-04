import puppeteer from "puppeteer-core";

async function scrape() {
  // Connect to running Chrome
  const res = await fetch("http://127.0.0.1:9222/json/version");
  const { webSocketDebuggerUrl } = await res.json();
  
  const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });
  
  // Create new page
  const page = await browser.newPage();
  
  console.log("Navigating to Tmall...");
  await page.goto("https://detail.tmall.com/item.htm?id=742487634701", {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  await page.waitForTimeout(3000);

  const data = await page.evaluate(() => {
    const body = document.body?.innerText || "";
    const h1 = document.querySelector("h1")?.textContent?.trim() || "";
    const title = document.querySelector(".ItemTitle--tbTitleBreakWord, .tb-main-title")?.textContent?.trim() || h1;
    
    let price = "";
    document.querySelectorAll("*").forEach((e) => {
      if (e.children.length === 0 && /^[¥￥]\d/.test(e.textContent || "")) {
        price = e.textContent.trim();
      }
    });
    
    const sales = document.querySelector(".tm-count, .tm-sale-count")?.textContent?.trim() || "";
    
    return { title, price, sales, bodySnippet: body.substring(0, 3000) };
  });

  console.log(JSON.stringify(data, null, 2));
  
  await page.close();
  await browser.disconnect();
}

scrape().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
