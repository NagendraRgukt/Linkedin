import express from 'express';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/comment', async (req, res) => {
  const { postUrl, comment } = req.body;

  if (!postUrl || !comment) {
    return res.status(400).json({ error: 'Missing postUrl or comment' });
  }

  let browser;

  try {
    const cookies = JSON.parse(await fs.readFile('./linkedin-cookies.json', 'utf-8'));

    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setCookie(...cookies);

    await page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 0 });

    await page.waitForSelector('.comments-comment-box__form', { timeout: 15000 });
    await page.click('.comments-comment-box__form');

    await page.waitForSelector('div[contenteditable="true"]', { timeout: 15000 });
    await page.type('div[contenteditable="true"]', comment);

    await page.click('button.comments-comment-box__submit-button');

    await page.waitForTimeout(5000);

    res.json({ message: 'Comment posted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to comment on LinkedIn post', details: err.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.get('/', (req, res) => {
  res.send('LinkedIn Comment Bot is running.');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
