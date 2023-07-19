import puppeteer from "puppeteer";
import movements from "./movements.mjs";
import path from 'path';


(async () => {
  const url = path.normalize(`${process.env.PWD}/../index.html`);

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--start-maximized", // you can also use '--start-fullscreen'
    ],
  });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(`file://${url}`);

  // Set screen size
  await page.setViewport({ width: 1366, height: 768 });

  // Wait network idle
  await page.waitForNetworkIdle();

  // Wait and click on first result
  await page.waitForSelector("#start-btn");
  await page.click("#start-btn");

  // Simulate click
  await page.waitForSelector("body");

  // Simulate mouse movement
  for (let movement of movements) {
    const [x, y] = movement;

    if (x % 100 === 0) {
      await page.mouse.click(x, y);
    }

    await page.mouse.move(x, y);
  }

  await page.screenshot({path: 'screenshot.png'});
  await browser.close();
})();
