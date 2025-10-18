#!/bin/bash

# Student Progress Tracker React App Deployment Script
# This script builds and prepares the React app for deployment

echo "🚀 Building Student Progress Tracker React App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Run linting
# echo "🔍 Running ESLint..."
# npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Production files are in the 'dist/' directory"
echo ""
echo "📋 Deployment Instructions:"
echo "1. Upload the contents of the 'dist/' folder to your web server"
echo "2. Configure your server to serve index.html for all routes"
echo "3. Ensure API endpoints are accessible at /tracker"
echo "4. Verify Google OAuth client ID is configured correctly"
echo ""
echo "🌐 The app will be available at your server's URL"

# Optional: Preview the build
# echo "🔍 Previewing build..."
# npm run preview