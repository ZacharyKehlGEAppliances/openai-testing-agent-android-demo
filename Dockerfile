FROM node:18-slim

# Install Playwright dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright
RUN npm install -g playwright@latest
RUN npx playwright install
RUN npx playwright install-deps

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000 3005 8000

CMD ["npm", "run", "dev"]
