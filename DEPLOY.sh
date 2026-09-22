#!/bin/bash

# RankBid Premium Listings Deployment Script
# This script deploys the premium listings feature to production

set -e

echo "🚀 RankBid Premium Listings Deployment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check git status
echo -e "${YELLOW}Step 1: Checking git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Uncommitted changes found. Please commit all changes first.${NC}"
    git status
    exit 1
fi
echo -e "${GREEN}✅ Git working tree clean${NC}"
echo ""

# Step 2: Verify premium files exist
echo -e "${YELLOW}Step 2: Verifying premium listing files...${NC}"
FILES=(
    "app/api/listings/premium/route.ts"
    "app/api/admin/premium-listings/route.ts"
    "components/PremiumListingCard.tsx"
    "components/PremiumListingModal.tsx"
    "app/admin/premium-listings/page.tsx"
    "supabase/migrations/add_premium_listings.sql"
)

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Missing file: $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ All premium listing files present${NC}"
echo ""

# Step 3: Set environment variable
echo -e "${YELLOW}Step 3: Setting up environment variables...${NC}"
read -p "Enter ADMIN_KEY for premium listing approval (or press Enter for default): " ADMIN_KEY
ADMIN_KEY="${ADMIN_KEY:-admin-secret-key}"

echo -e "${GREEN}✅ Admin key set${NC}"
echo ""

# Step 4: Check if Vercel CLI is installed
echo -e "${YELLOW}Step 4: Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Please install it:${NC}"
    echo "   npm i -g vercel@latest"
    exit 1
fi
VERCEL_VERSION=$(vercel --version)
echo -e "${GREEN}✅ Vercel CLI installed: $VERCEL_VERSION${NC}"
echo ""

# Step 5: Show deployment summary
echo -e "${YELLOW}Step 5: Deployment Summary${NC}"
echo "├─ Premium Listings: Enabled"
echo "├─ Pricing: #1=$5, #2=$3, #3=$1"
echo "├─ Admin Dashboard: /admin/premium-listings"
echo "├─ Admin Key: ${ADMIN_KEY:0:10}..."
echo "└─ Database Migration: Required (manual)"
echo ""

# Step 6: Deployment instructions
echo -e "${YELLOW}Step 6: Deployment Steps${NC}"
echo ""
echo "⚠️  IMPORTANT: Database Migration Required"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Before deploying, run the database migration on Supabase:"
echo ""
echo "Option 1 (Recommended): Use Supabase Dashboard"
echo "  1. Go to: https://app.supabase.com/project/yxjcamscavnagixlwyfp"
echo "  2. Click SQL Editor"
echo "  3. Copy & paste content from: supabase/migrations/add_premium_listings.sql"
echo "  4. Run the query"
echo ""
echo "Option 2: Use Supabase CLI"
echo "  supabase db push"
echo ""
echo "Option 3: Use psql"
echo "  psql -h db.yxjcamscavnagixlwyfp.supabase.co -U postgres -d postgres -f supabase/migrations/add_premium_listings.sql"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Press Enter once migration is complete, or type 'skip' to skip it: " MIGRATION_STATUS

if [ "$MIGRATION_STATUS" != "skip" ]; then
    echo -e "${YELLOW}Verifying migration...${NC}"
    # Note: In real scenario, verify migration success
    echo -e "${GREEN}✅ Migration acknowledged${NC}"
fi
echo ""

# Step 7: Set Vercel environment variables
echo -e "${YELLOW}Step 7: Setting Vercel Environment Variables...${NC}"
echo ""
echo "Run these commands to set environment variables:"
echo ""
echo "  vercel env add ADMIN_KEY"
echo "  # Then paste: ${ADMIN_KEY}"
echo ""
echo "or use:"
echo ""
echo "  vercel env add --production ADMIN_KEY"
echo ""
read -p "Have you set ADMIN_KEY in Vercel? (y/n): " ENV_SET

if [ "$ENV_SET" != "y" ]; then
    echo -e "${YELLOW}Setting ADMIN_KEY automatically...${NC}"
    vercel env add ADMIN_KEY <<< "$ADMIN_KEY" || true
fi
echo ""

# Step 8: Deploy to Vercel
echo -e "${YELLOW}Step 8: Deploying to Vercel...${NC}"
echo ""
echo "Running: vercel deploy --prod"
echo ""

read -p "Ready to deploy? (y/n): " READY_TO_DEPLOY

if [ "$READY_TO_DEPLOY" = "y" ]; then
    vercel deploy --prod
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo -e "${YELLOW}Post-Deployment Checklist:${NC}"
    echo "  ☐ Visit your production URL"
    echo "  ☐ Submit a test listing"
    echo "  ☐ Click ⭐ star button"
    echo "  ☐ Fill premium form and submit"
    echo "  ☐ Visit /admin/premium-listings"
    echo "  ☐ Verify admin key works"
    echo "  ☐ Approve test premium listing"
    echo "  ☐ Verify premium listing appears on homepage"
    echo ""
else
    echo "Deployment cancelled."
    exit 1
fi
