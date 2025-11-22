# Mathspedia

A Wikipedia clone for mathematics with advanced features for collaborative editing, authority-based content management, and source verification.

## Features

### Article Structure
- **Standard Articles**: Introduction, Main Content, References, Further Reading, External Links
- **Mathematical Theorems**: Additional sections for History, Applications, Related Concepts, and See Also
- **Hyperlink System**: Use `[[Article Name]]` syntax to create links between articles

### User Authentication & Authority System
- **User Ranks** (in order of authority):
  1. Math Enjoyer
  2. Undergraduate
  3. Graduate
  4. Math Teacher
  5. PhD
  6. Professor

- **Editing Restrictions**: Lower-ranked users cannot edit content created by higher-ranked users

### A/B Testing System
- When users of the same rank have conflicting edits, alternative versions are created
- Users can compare versions and provide feedback based on their rank and helpfulness rating
- Feedback helps determine which version is more valuable

### Source Reporting
- Users can report sources as outdated or false
- Alerts appear on all articles that reference reported sources
- Helps maintain accuracy as mathematics evolves

### Enhanced Math Features
- **LaTeX Support**: Full LaTeX rendering via Math extension
- **Custom Formatting**: `<color value="red">text</color>` and `<size value="large">text</size>` tags
- **Manim Code Blocks**: Display and copy Manim Python code for animations
- **Interactive Code**: Sandboxed JavaScript code blocks with controlled MathAPI
- **External Embeds**: Embed external services like Desmos, GeoGebra via iframes

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

5. **Complete MediaWiki installation:**
   - Open http://localhost:8080 in your browser
   - Follow the installation wizard
   - Database credentials:
     - Host: 127.0.0.1
     - Database: wikidb
     - User: wikiuser
     - Password: wikipass

6. **Setup database tables for extensions:**
   ```bash
   mysql -u wikiuser -pwikipass wikidb < setup-database.sql
   ```

7. **Enable extensions in LocalSettings.php:**
   The extensions are already configured in LocalSettings.php

## Development

### Extensions

- **MathspediaAuthority**: Authority-based editing system
- **MathspediaABTesting**: A/B testing for same-rank conflicts
- **MathspediaMath**: Enhanced math features (LaTeX, interactive code, etc.)

### File Structure

```
mathspedia/
├── mediawiki/              # MediaWiki installation
│   ├── extensions/         # Custom extensions
│   │   ├── MathspediaAuthority/
│   │   ├── MathspediaABTesting/
│   │   └── MathspediaMath/
│   └── LocalSettings.php   # Configuration
├── setup-database.sql      # Database schema
├── nginx.conf.example      # Nginx configuration
└── .github/workflows/      # CI/CD
```

## Deployment

### Automatic Deployment

The repository includes GitHub Actions workflow for automatic deployment to production server.

### Manual Deployment

1. **Clone repository on server:**
   ```bash
   git clone https://github.com/mathspedia/mathspedia.git /var/www/mathspedia
   ```

2. **Setup Nginx:**
   ```bash
   cp nginx.conf.example /etc/nginx/sites-available/mathspedia
   ln -s /etc/nginx/sites-available/mathspedia /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

3. **Setup SSL (Let's Encrypt):**
   ```bash
   certbot --nginx -d mathspedia.org -d www.mathspedia.org
   ```

4. **Run MediaWiki updates:**
   ```bash
   cd /var/www/mathspedia/mediawiki
   php maintenance/update.php
   ```

## Usage

### Creating/Editing Articles

1. Log in with your account
2. Navigate to or create an article
3. Click "Edit" (if you have permission based on your rank)
4. Use MediaWiki syntax or special tags for formatting

### Special Tags

- **Color**: `<color value="red">text</color>`
- **Size**: `<size value="large">text</size>`
- **Manim**: `<manim>code here</manim>`
- **Interactive**: `<interactive>JavaScript code</interactive>`
- **Embed**: `<embed url="https://example.com" width="800" height="600"/>`

### A/B Testing

1. If you see an A/B test notice, click "Compare versions"
2. Review different versions
3. Submit feedback with helpfulness rating (1-5)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

GPL-2.0-or-later

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed changelog.
