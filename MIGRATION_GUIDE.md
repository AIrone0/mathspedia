# Migration Guide: localStorage to MediaWiki

This guide explains how to migrate your articles and data from the old localStorage-based system to MediaWiki.

## Step 1: Export Data from Browser

Open your browser's developer console (F12) and run:

```javascript
const data = {
    articles: JSON.parse(localStorage.getItem('articles') || '{}'),
    users: JSON.parse(localStorage.getItem('users') || '{}'),
    abTests: JSON.parse(localStorage.getItem('abTests') || '{}'),
    reportedSources: JSON.parse(localStorage.getItem('reportedSources') || '{}')
};

// Copy the output
console.log(JSON.stringify(data, null, 2));

// Or download as file
const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'mathspedia-export.json';
a.click();
```

Save the exported JSON to `data-export.json` in the project root.

## Step 2: Run Migration Script

From within the nix-shell:

```bash
php migrate-to-mediawiki.php data-export.json
```

The script will:
- Create users with their ranks
- Migrate all articles to MediaWiki pages
- Convert article structure to MediaWiki wikitext
- Store A/B test data and reported sources for later processing

## Step 3: Setup Extensions

Run the extension setup script:

```bash
./setup-extensions.sh
```

This will:
- Create database tables for A/B testing and reported sources
- Verify extensions are properly installed

## Step 4: Verify Migration

1. Check that articles appear in MediaWiki
2. Verify user ranks are set correctly
3. Test editing permissions based on ranks
4. Check that A/B test data was preserved

## Troubleshooting

### Users not created
- Make sure usernames are valid MediaWiki usernames (no special characters)
- Check that the admin user exists

### Articles not migrated
- Check for invalid titles (special characters, etc.)
- Verify MediaWiki is properly installed
- Check PHP error logs

### Extensions not working
- Verify extensions are in `mediawiki/extensions/`
- Check `LocalSettings.php` has `wfLoadExtension()` calls
- Run `php maintenance/update.php` in MediaWiki directory

## Manual Migration

If the automated script fails, you can manually migrate:

1. **Create users:**
   - Go to Special:CreateAccount in MediaWiki
   - Set user rank via user preferences or database

2. **Create articles:**
   - Create pages manually
   - Copy content from old system
   - Convert formatting to MediaWiki syntax

3. **Set author ranks:**
   - Use the database or page properties to set `mathspedia_author_rank`

## Post-Migration

After migration:
- Review migrated articles for formatting issues
- Update any broken links
- Test A/B testing functionality
- Verify authority system is working

