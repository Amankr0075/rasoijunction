const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login');
  
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'stafftest@example.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  const url = page.url();
  console.log('Navigated to:', url);
  
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body Text:', bodyText.substring(0, 500));
  
  await browser.close();
})();
