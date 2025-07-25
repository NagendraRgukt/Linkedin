FROM node:18-slim

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  libgbm-dev \
  libxshmfence-dev \
  libxss1 \
  libxtst6 \
  chromium \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install

# Puppeteer will use Chromium installed by apt
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Start the app
CMD ["node", "index.js"] 
