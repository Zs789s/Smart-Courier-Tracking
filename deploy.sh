#!/bin/bash
# Quick Deploy Script for Smart Courier System

echo "========================================="
echo "  Smart Courier System - Deploy Script"
echo "========================================="
echo ""

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git found"
echo ""

# Display next steps
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  CREATE GITHUB REPOSITORY"
echo "   → Go to https://github.com/new"
echo "   → Name: smart-courier-system"
echo "   → Make it Public"
echo "   → Click Create"
echo ""

echo "2️⃣  PUSH CODE TO GITHUB"
echo "   Replace YOUR_USERNAME with your GitHub username, then run:"
echo ""
echo "   git remote set-url origin https://github.com/YOUR_USERNAME/smart-courier-system.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""

echo "3️⃣  DEPLOY TO RENDER"
echo "   → Go to https://render.com/register"
echo "   → Sign up with GitHub"
echo "   → Click + New → Web Service"
echo "   → Select smart-courier-system repo"
echo "   → Configuration:"
echo "      - Name: smart-courier-system"
echo "      - Build Command: npm install"
echo "      - Start Command: npm start"
echo "   → Click Create Web Service"
echo "   → Wait 3-5 minutes..."
echo ""

echo "4️⃣  YOUR SITE WILL BE LIVE AT:"
echo "   🌐 https://smart-courier-system.onrender.com"
echo ""

echo "========================================="
echo "  Test Accounts"
echo "========================================="
echo ""
echo "👤 USER LOGIN:"
echo "   Email: user@test.com"
echo "   Password: password123"
echo ""
echo "👔 OWNER LOGIN:"
echo "   Email: owner@test.com"
echo "   Password: password123"
echo ""

echo "========================================="
echo "  Auto-Deploy Setup"
echo "========================================="
echo ""
echo "After deployment, push changes to auto-deploy:"
echo ""
echo "   git add ."
echo "   git commit -m 'Your message'"
echo "   git push origin main"
echo ""
echo "✅ Site updates automatically in 2-3 minutes!"
echo ""

echo "========================================="
echo "  Ready to Deploy?"
echo "========================================="
echo ""
echo "📝 For detailed instructions, see:"
echo "   → RENDER_DEPLOYMENT.md"
echo "   → DEPLOY_NOW.md"
echo ""
echo "🚀 Let's go live!"
