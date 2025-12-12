#!/bin/bash

# NomadicNook Homepage Redesign - Installation Script
# This script will install dependencies and prepare your project

echo "🎨 NomadicNook Homepage Redesign - Installation"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the shell directory:"
    echo "cd travel-ecosystem/shell"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open your browser to the URL shown (usually http://localhost:5173)"
echo ""
echo "3. See your new Viator-inspired homepage!"
echo ""
echo "📚 Documentation:"
echo "   - Full guide: VIATOR_REDESIGN_DOCUMENTATION.md"
echo "   - Quick start: VIATOR_REDESIGN_QUICKSTART.md"
echo "   - Summary: VIATOR_REDESIGN_SUMMARY.md"
echo "   - Component map: VIATOR_REDESIGN_COMPONENT_MAP.md"
echo ""
echo "🎯 What's new:"
echo "   ✨ New hero section with clean search"
echo "   ✨ Benefits section with trust icons"
echo "   ✨ Rewards/login CTA section"
echo "   ✨ Redesigned destination cards"
echo "   ✨ Tours carousel with pricing"
echo "   ✨ Comprehensive footer"
echo "   ✨ Complete design system"
echo ""
echo "Happy coding! 🎉"
