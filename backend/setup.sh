#!/bin/bash

echo "🚀 IPA Noten Rechner - Backend Setup"
echo ""

if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed"
    echo "Install with: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✓ Bun installed: $(bun --version)"
echo ""

echo "📦 Installing dependencies..."
bun install

echo ""
echo "🗄️  Setting up database..."
echo "Make sure PostgreSQL is running and .env is configured"
echo ""

read -p "Run migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    bun run migrate
fi

echo ""
read -p "Seed database with test user? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    bun run seed
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Start development server with:"
echo "  bun run dev"
echo ""
echo "Or start production server with:"
echo "  bun run start"
