# Mathspedia

A Wikipedia clone for mathematics with advanced features for collaborative editing, authority-based content management, and source verification.

## Installation

### Prerequisites
- Nix (for development environment)
- MariaDB/MySQL
- PHP 8.1+
- Composer

### Setup

1. **Enter Nix shell:**
   ```bash
   nix-shell
   ```

2. **Setup database:**
   ```bash
   ./setup-mediawiki.sh
   ```

3. **Start PHP server:**
   ```bash
   ./start-mediawiki.sh
   ```

4. **Complete MediaWiki installation:**
   - Open http://localhost:8080 in your browser
   - Follow the installation wizard
   - Database credentials:
     - Host: 127.0.0.1
     - Database: wikidb
     - User: wikiuser
     - Password: wikipass

5. **Setup database tables for extensions:**
   ```bash
   mysql -u wikiuser -pwikipass wikidb < setup-database.sql
   ```

6. **Enable extensions in LocalSettings.php:**
   The extensions are already configured in LocalSettings.php

## Development

### File Structure

```
mathspedia/
├── mediawiki/              # MediaWiki installation (created during setup)
│   ├── extensions/         # Custom extensions
│   └── LocalSettings.php   # Configuration
├── setup-database.sql      # Database schema
├── docker-compose.yml      # Docker setup (optional)
└── shell.nix              # Nix development environment
```

## License

GPL-2.0-or-later
