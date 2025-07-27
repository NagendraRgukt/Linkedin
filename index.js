import express from 'express';
import puppeteer from 'puppeteer-core';
import bodyParser from 'body-parser';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (_, res) => {
  res.send('LinkedIn Comment Bot is running.');
});

app.post('/comment', async (req, res) => {
  const { postUrl, commentText, cookies } = req.body;

  if (!postUrl || !commentText || !cookies) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});


    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.goto(postUrl, { waitUntil: 'networkidle2' });

    await page.waitForSelector('button[aria-label="Leave a comment"]', { timeout: 10000 });
    await page.click('button[aria-label="Leave a comment"]');

    await page.waitForSelector('div[contenteditable="true"]', { timeout: 10000 });
    await page.type('div[contenteditable="true"]', commentText);
    await page.keyboard.press('Enter');

    await page.waitForTimeout(3000); // wait to confirm post

    res.json({ success: true, message: 'Comment posted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to comment on LinkedIn post', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
