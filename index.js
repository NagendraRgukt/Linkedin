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

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Load cookies for LinkedIn session
    const cookiesString = await fs.readFile('./linkedin-cookies.json');
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);

    await page.goto(postUrl, { waitUntil: 'networkidle2' });

    // Wait and click the comment input
    await page.waitForSelector('[aria-label="Add a comment"]', { timeout: 10000 });
    await page.click('[aria-label="Add a comment"]');
    await page.keyboard.type(comment);
    await page.keyboard.press('Enter');

    await browser.close();

    res.json({ status: 'Comment posted successfully' });
  } catch (error) {
    console.error('Error commenting on LinkedIn:', error.message);
    res.status(500).json({ error: 'Failed to comment on LinkedIn post', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('LinkedIn Comment Bot is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
