# Mobile Testing Setup Guide

## Prerequisites

1. Node.js (v18 or higher)
2. npm or yarn
3. OpenAI API key

## Installation

1. Clone the repository
2. Install dependencies for all components:

```bash
# Install root dependencies
npm install

# Install cua-server dependencies
cd cua-server
npm install
npx playwright install
npx playwright install-deps

# Install frontend dependencies
cd ../frontend
npm install

# Install sample-test-app dependencies
cd ../sample-test-app
npm install
