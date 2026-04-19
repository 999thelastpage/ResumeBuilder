#!/bin/bash
set -e

echo "======================================"
echo "🚀 CV Modernizer - VPS Deploy Script"
echo "======================================"

# 1. Check if Docker is installed
if command -v docker > /dev/null 2>&1; then
    echo "✅ Docker is already installed: $(docker --version)"
else
    echo "🐳 Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed successfully."
fi

# 2. Check for Docker Compose (Plugin or Standalone)
if docker compose version > /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
    echo "✅ Docker Compose plugin found."
elif command -v docker-compose > /dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
    echo "✅ docker-compose standalone found."
else
    echo "🐳 Docker Compose not found. Installing..."
    apt-get update
    apt-get install -y docker-compose-plugin
    DOCKER_COMPOSE="docker compose"
fi

# 2. Check if .env exists, if not create it
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env not found!"
    echo "Creating a template .env file..."
    cp backend/.env.example backend/.env 2>/dev/null || touch backend/.env
    echo "GEMINI_API_KEY=your_gemini_key_here" >> backend/.env
    echo "SUPABASE_URL=your_supabase_url_here" >> backend/.env
    echo "SUPABASE_KEY=your_supabase_service_role_key_here" >> backend/.env
    
    echo "❌ PLEASE EDIT backend/.env with your actual API keys, then run this script again."
    exit 1
fi

# 3. Detect Public IP or use Domain argument
if [ -n "$1" ]; then
    echo "🌐 Using provided domain: $1"
    export NEXT_PUBLIC_API_URL="https://$1"
    export FRONTEND_URL="https://$1"
elif [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "🔍 NEXT_PUBLIC_API_URL not set. Detecting Public IP..."
    PUBLIC_IP=$(curl -s https://ifconfig.me || curl -s https://api.ipify.org || echo "localhost")
    export NEXT_PUBLIC_API_URL="http://${PUBLIC_IP}:8000"
    export FRONTEND_URL="http://${PUBLIC_IP}:3000"
fi
echo "📍 Using NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
echo "📍 Using FRONTEND_URL: $FRONTEND_URL"

# 4. Firewall Setup
if command -v ufw > /dev/null 2>&1; then
    echo "🛡️  Configuring Firewall (ufw)..."
    ufw allow 3000/tcp > /dev/null 2>&1 || true
    ufw allow 8000/tcp > /dev/null 2>&1 || true
    echo "✅ Ports 3000 and 8000 opened."
else
    echo "⏩ Skipping firewall (ufw not found)."
fi

# 5. Pull and Build
echo "🏗️  Building Docker containers (this may take a few minutes)..."
$DOCKER_COMPOSE build

# 6. Run
echo "🚀 Starting services..."
$DOCKER_COMPOSE up -d

echo "======================================"
echo "✅ Deployment successful!"
echo "🌐 Frontend running on: http://localhost:3000"
echo "🔌 Backend API running on: http://localhost:8000"
echo "======================================"
echo "Note: To make this accessible publicly, set up NGINX to proxy port 80/443 to port 3000,"
echo "and set NEXT_PUBLIC_API_URL in docker-compose.yml to your public backend URL."
