FROM node:18-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
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
    libgbm1 \
    libxshmfence1 \
    libglu1-mesa \
    wget \
    unzip \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Chromium manually
RUN wget https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1222956/chrome-linux.zip && \
    unzip chrome-linux.zip && \
    mv chrome-linux /opt/chromium && \
    ln -s /opt/chromium/chrome /usr/bin/chromium && \
    rm chrome-linux.zip

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install

# Run the app
CMD ["npm", "start"]
