FROM node:18-slim

# Puppeteer v19+ requires extra dependencies for Chromium
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
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy your source files
COPY package*.json ./
COPY . .

# Install dependencies (this will also download Chromium via Puppeteer)
RUN npm install --force

# Expose your Puppeteer bot on a port
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
