import express from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer-core';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const cookies = JSON.parse(fs.readFileSync('./linkedin-cookies.json', 'utf-8'));

app.post('/comment', async (req, res) => {
  const { postUrl, comment } = req.body;

  if (!postUrl || !comment) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('button.comment-button'); // May need adjusting
    await page.click('button.comment-button');

    await page.waitForSelector('div.comments-comment-box__contenteditable');
    await page.type('div.comments-comment-box__contenteditable', comment);

    await page.waitForSelector('button.comments-comment-box__submit-button');
    await page.click('button.comments-comment-box__submit-button');

    await browser.close();

    res.json({ success: true, message: 'Comment posted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to comment on LinkedIn post', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('LinkedIn Comment Bot is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
