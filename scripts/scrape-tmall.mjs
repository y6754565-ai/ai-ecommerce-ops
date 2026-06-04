import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const URL = "https://detail.tmall.com/item.htm?id=742487634701";

async function scrape() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Navigating...");
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 30000 });

  const pageTitle = await page.title();
  console.log("Title:", pageTitle);

  // Wait for product content to load
  await page.waitForSelector("h1, .tb-main-title, .ItemTitle", { timeout: 10000 }).catch(() => {});

  const data = await page.evaluate(() => {
    const getText = (el) => el?.textContent?.trim() || "";

    // Title
    const title =
      getText(document.querySelector(".ItemTitle--tbTitleBreakWord")) ||
      getText(document.querySelector(".tb-main-title")) ||
      getText(document.querySelector("h1")) ||
      getText(document.querySelector('[data-spm="1000983"]'));

    // Price - try multiple selectors
    let price = "";
    const priceEls = document.querySelectorAll("*");
    for (const el of priceEls) {
      if (el.children.length === 0 && /^[¥￥]\s*\d+\.?\d*/.test(el.textContent || "")) {
        price = el.textContent.trim();
        break;
      }
    }
    if (!price) {
      price =
        getText(document.querySelector(".tm-price")) ||
        getText(document.querySelector(".Price--priceText"));
    }

    // Sales
    const sales =
      getText(document.querySelector(".tm-sale-count")) ||
      getText(document.querySelector(".tm-count")) ||
      getText(document.querySelector('[class*="sellCount"]')) ||
      getText(document.querySelector('[class*="saleCount"]'));

    // All text for analysis
    const bodyText = document.body?.innerText?.substring(0, 5000) || "";

    return { title, price, sales, bodySnippet: bodyText.substring(0, 2000) };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

scrape().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
