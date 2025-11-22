#!/usr/bin/env bash

# Setup script for MediaWiki with MariaDB
set -e

MYSQL_SOCKET="$PWD/.mysql.sock"
MYSQL_DATA="$PWD/.mysql-data"
DB_NAME="wikidb"
DB_USER="wikiuser"
DB_PASS="wikipass"

echo "=== MediaWiki Setup ==="

# Create MySQL data directory
mkdir -p "$MYSQL_DATA"

# Initialize database if needed
if [ ! -f "$MYSQL_DATA/mysql/user.MYD" ]; then
    echo "Initializing MariaDB database..."
    mysql_install_db --datadir="$MYSQL_DATA" --user=$(whoami) 2>&1 | grep -v "\[Warning\]" || true
    echo "Database initialized"
fi

# Start MariaDB if not running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "Starting MariaDB..."
    # Set temp directory for Nix environment
    export TMPDIR="$PWD/.mysql-tmp"
    mkdir -p "$TMPDIR"
    # Allow TCP/IP connections on port 3306 for MediaWiki
    mysqld --datadir="$MYSQL_DATA" --socket="$MYSQL_SOCKET" --pid-file="$PWD/.mysql.pid" --port=3306 --tmpdir="$TMPDIR" &
    sleep 4
    echo "MariaDB started (socket: $MYSQL_SOCKET, port: 3306)"
else
    echo "MariaDB already running"
fi

# Create database and user
echo "Creating database and user..."
# Connect as current user (no password needed after mysql_install_db)
mysql -S "$MYSQL_SOCKET" <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME};
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "Database created: ${DB_NAME}"
echo "User created: ${DB_USER}"
echo ""
echo "Next steps:"
echo "1. Start PHP server: cd mediawiki && php -S localhost:8080"
echo "2. Open http://localhost:8080 in your browser"
echo ""
echo "Database credentials for MediaWiki installer:"
echo "  Database name: ${DB_NAME}"
echo "  Database user: ${DB_USER}"
echo "  Database password: ${DB_PASS}"
echo "  Database host: localhost"
echo "  Database port: 3306"

