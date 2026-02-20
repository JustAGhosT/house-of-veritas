#!/bin/bash
# House of Veritas - Supervisor Setup Script
# This script configures supervisor to manage the Next.js application

set -e

echo "============================================"
echo "House of Veritas - Supervisor Setup"
echo "============================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  Please run as root (sudo ./setup-supervisor.sh)"
    exit 1
fi

# Backup existing config if it exists
SUPERVISOR_CONF="/etc/supervisor/conf.d/nextjs.conf"
if [ -f "$SUPERVISOR_CONF" ]; then
    echo "📦 Backing up existing config..."
    cp "$SUPERVISOR_CONF" "${SUPERVISOR_CONF}.backup.$(date +%Y%m%d%H%M%S)"
fi

# Copy our Next.js supervisor config
echo "📝 Installing supervisor configuration..."
cp /app/config/supervisor/nextjs.conf "$SUPERVISOR_CONF"

# Ensure log directory exists
mkdir -p /var/log/supervisor

# Build the Next.js app first
echo "🔨 Building Next.js application..."
cd /app
yarn build

# Update supervisor
echo "🔄 Reloading supervisor configuration..."
supervisorctl reread
supervisorctl update

# Start the nextjs service
echo "🚀 Starting Next.js service..."
supervisorctl start nextjs || true

# Check status
echo ""
echo "============================================"
echo "📊 Service Status"
echo "============================================"
supervisorctl status nextjs

echo ""
echo "✅ Supervisor setup complete!"
echo ""
echo "Useful commands:"
echo "  - Check status:  supervisorctl status nextjs"
echo "  - Restart:       supervisorctl restart nextjs"
echo "  - View logs:     tail -f /var/log/supervisor/nextjs.out.log"
echo "  - View errors:   tail -f /var/log/supervisor/nextjs.err.log"
echo ""
