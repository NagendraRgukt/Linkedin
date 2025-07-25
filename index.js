const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json());

app.post('/comment', async (req, res) => {
  const { postUrl, commentText, cookies } = req.body;

  if (!postUrl || !commentText || !cookies) {
    return res.status(400).json({ error: 'Missing postUrl, commentText, or cookies' });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setCookie(...cookies);
  await page.goto(postUrl, { waitUntil: 'networkidle2' });

  try {
    await page.waitForSelector('[aria-label="Leave a comment"]', { timeout: 15000 });
    await page.click('[aria-label="Leave a comment"]');
    await page.waitForSelector('div[contenteditable="true"]');
    await page.type('div[contenteditable="true"]', commentText);
    await page.keyboard.press('Enter');

    await browser.close();
    return res.json({ success: true });
  } catch (error) {
    await browser.close();
    return res.status(500).json({ error: 'Comment failed', details: error.toString() });
  }
});

app.listen(3000, () => console.log('Puppeteer server running on port 3000'));
