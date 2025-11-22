#!/usr/bin/env bash

# Setup script for Mathspedia extensions
# This script sets up the database tables and verifies extensions are loaded

DB_NAME="wikidb"
DB_USER="wikiuser"
DB_PASS="wikipass"
MYSQL_SOCKET="$PWD/.mysql.sock"

echo "=== Setting up Mathspedia Extensions ==="

# Check if we're in nix-shell
if [ -z "$IN_NIX_SHELL" ]; then
    echo "Please run this script from within nix-shell"
    exit 1
fi

# Setup database tables
echo "Creating database tables..."
mysql --socket="$MYSQL_SOCKET" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < setup-database.sql

if [ $? -eq 0 ]; then
    echo "✓ Database tables created"
else
    echo "Error: Failed to create database tables"
    exit 1
fi

# Verify extensions directory exists
echo "Verifying extensions..."
for ext in MathspediaAuthority MathspediaABTesting MathspediaMath; do
    if [ -d "mediawiki/extensions/$ext" ]; then
        echo "  ✓ $ext extension found"
    else
        echo "  ✗ $ext extension not found"
    fi
done

# Check LocalSettings.php
if grep -q "MathspediaAuthority" mediawiki/LocalSettings.php 2>/dev/null; then
    echo "✓ Extensions are loaded in LocalSettings.php"
else
    echo "⚠ Warning: Extensions may not be loaded in LocalSettings.php"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify extensions are working: http://localhost:8080"
echo "2. Test authority system by creating users with different ranks"
echo "3. Test A/B testing by having same-rank users edit the same page"

