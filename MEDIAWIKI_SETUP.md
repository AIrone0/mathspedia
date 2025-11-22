# MediaWiki Setup Guide

This guide will help you set up MediaWiki locally using Nix.

## Prerequisites

- Nix installed on your system
- Enter the Nix shell: `nix-shell`

## Quick Start

1. **Enter the Nix shell:**
   ```bash
   nix-shell
   ```

2. **Set up the database:**
   ```bash
   ./setup-mediawiki.sh
   ```
   This will:
   - Start MariaDB
   - Create the database (`wikidb`)
   - Create a database user (`wikiuser`)

3. **Start the PHP development server:**
   ```bash
   cd mediawiki
   php -S localhost:8080
   ```

5. **Open your browser:**
   Navigate to `http://localhost:8080` to run the MediaWiki installer.

## MediaWiki Installation

When you first open `http://localhost:8080`, you'll see the MediaWiki installer. Use these settings:

- **Database type:** MySQL or MariaDB
- **Database host:** `localhost`
- **Database name:** `wikidb`
- **Database username:** `wikiuser`
- **Database password:** `wikipass`
- **Database port:** `3306` (default)

## Stopping Services

To stop MariaDB:
```bash
pkill mysqld
# Or if you have the PID file:
kill $(cat .mysql.pid)
```

## Troubleshooting

### MariaDB won't start
- Make sure the `.mysql-data` directory exists
- Check if another MySQL instance is running: `pgrep mysqld`
- Check the socket file: `ls -la .mysql.sock`

### PHP extensions missing
All required PHP extensions should be included in the Nix shell. If you see errors about missing extensions, make sure you're in the Nix shell.

### Port 8080 already in use
Change the port in the PHP server command:
```bash
php -S localhost:8081
```

## Next Steps

After MediaWiki is installed:
1. Setup database tables for extensions: `mysql -u wikiuser -pwikipass wikidb < setup-database.sql`
2. Start creating articles using MediaWiki's standard interface
3. Custom features (A/B testing, authority system, etc.) are already configured

