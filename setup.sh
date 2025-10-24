#!/bin/bash

# Poultry Disease Monitoring System - Setup Script
# Run this script with: chmod +x setup.sh && ./setup.sh

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🐔 Poultry Disease Monitoring System - Setup Wizard    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check Node.js installation
echo -e "${YELLOW}📦 Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js is installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/${NC}"
    exit 1
fi

# Check npm installation
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm is installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm is not installed. Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📥 Installing Frontend Dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

echo ""
echo -e "${YELLOW}📥 Installing Backend Dependencies...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend installation failed${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

echo ""
echo -e "${YELLOW}📝 Setting up environment files...${NC}"

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    cp ".env.local.example" ".env.local"
    echo -e "${GREEN}✅ Created .env.local - Please configure it with your Firebase credentials${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local already exists - skipping${NC}"
fi

# Create backend/.env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    cp "backend/.env.example" "backend/.env"
    echo -e "${GREEN}✅ Created backend/.env - Please configure it with your credentials${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists - skipping${NC}"
fi

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                  ✅ Setup Complete!                      ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Configure .env.local with your Firebase credentials"
echo "2. Configure backend/.env with MongoDB, HiveMQ, and Firebase Admin credentials"
echo "3. Create Firebase project and enable Email/Password authentication"
echo "4. Create MongoDB Atlas cluster and get connection string"
echo "5. Create HiveMQ Cloud account and get broker credentials"
echo ""
echo -e "${YELLOW}🚀 To start the application:${NC}"
echo "   Backend:  cd backend && npm start"
echo "   Frontend: npm run dev"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "   Quick Start:  SETUP_GUIDE.md"
echo "   Architecture: ARCHITECTURE.md"
echo "   Full Docs:    README.md"
echo ""
echo -e "${GREEN}Happy Monitoring! 🎉${NC}"
