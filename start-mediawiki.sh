#!/usr/bin/env bash

# Quick start script for MediaWiki
# Run this after entering nix-shell

cd "$(dirname "$0")"

echo "=== Starting MediaWiki ==="

# Check if MariaDB is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "Starting MariaDB..."
    ./setup-mediawiki.sh
    sleep 2
fi

# Start PHP server
echo "Starting PHP development server..."
echo "MediaWiki will be available at: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd mediawiki
# Use php.ini if it exists, otherwise use default
if [ -f "php.ini" ]; then
    php -c php.ini -S localhost:8080
else
    php -S localhost:8080
fi

