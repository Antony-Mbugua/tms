#!/bin/bash

# AOL TMS Fly.dev Deployment Script

echo "🚀 Deploying AOL TMS to Fly.dev..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Deploy backend first
echo "📦 Deploying backend..."
cd server

# Check if fly app exists
if ! flyctl apps list | grep -q "aol-tms-backend"; then
    echo "🆕 Creating new fly app for backend..."
    flyctl apps create aol-tms-backend
fi

# Set environment variables
echo "🔧 Setting environment variables..."
flyctl secrets set \
    JWT_SECRET="$(openssl rand -base64 32)" \
    ENCRYPTION_KEY="$(openssl rand -base64 32)" \
    DB_HOST="localhost" \
    DB_NAME="aol_tms" \
    DB_USER="root" \
    DB_PASSWORD="" \
    NODE_ENV="production"

# Deploy backend
echo "🚀 Deploying backend to fly.dev..."
flyctl deploy --config fly.toml

cd ..

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Deploy frontend (you can use a static hosting service or another fly app)
echo "✅ Backend deployed successfully!"
echo "🌍 Backend URL: https://aol-tms-backend.fly.dev"
echo ""
echo "📝 Next steps:"
echo "1. Update frontend environment to use the backend URL"
echo "2. Deploy frontend to your preferred static hosting service"
echo "3. Update CORS settings in backend if needed"
