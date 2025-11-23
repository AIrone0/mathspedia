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

# Check if port 8080 is already in use
PORT=8080
if lsof -i :$PORT > /dev/null 2>&1; then
    echo "Port $PORT is already in use."
    PID=$(lsof -ti :$PORT)
    echo "Found process $PID using port $PORT"
    echo "Killing it and using port $PORT..."
    kill $PID 2>/dev/null || true
    sleep 2
    # Double-check port is free now
    if lsof -i :$PORT > /dev/null 2>&1; then
        echo "Port still in use, switching to port 8081..."
        PORT=8081
    fi
fi

# Start PHP server
echo "Starting PHP development server..."
echo "MediaWiki will be available at: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd mediawiki
# Use php.ini if it exists, otherwise use default
if [ -f "php.ini" ]; then
    php -c php.ini -S localhost:$PORT
else
    php -S localhost:$PORT
fi

