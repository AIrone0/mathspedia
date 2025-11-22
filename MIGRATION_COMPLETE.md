# Migration Complete: Mathspedia to MediaWiki

## ✅ Completed Features

All custom features from the original JavaScript implementation have been migrated to MediaWiki extensions:

### 1. **MathspediaAuthority Extension**
- Authority-based editing restrictions
- Rank hierarchy: Math Enjoyer → Undergraduate → Graduate → Math Teacher → PhD → Professor
- Lower-ranked users cannot edit higher-ranked content
- Author rank stored in page properties

### 2. **MathspediaABTesting Extension**
- A/B testing for same-rank editing conflicts
- Special page: `Special:ABTesting`
- Feedback system with rank-weighted scoring
- Automatic version comparison

### 3. **MathspediaMath Extension**
All custom formatting and interactive features:

#### Custom Tags (XML-style, as in MediaWiki):
- **Color**: `<color value="red">text</color>`
- **Size**: `<size value="large">text</size>` (supports: small, medium, large, xlarge, xxlarge, or custom like "2em")
- **Manim Code**: `<manim>Python code here</manim>`
- **Interactive Code**: `<interactive>JavaScript code here</interactive>` (sandboxed with MathAPI)
- **External Embed**: `<embed url="https://example.com" width="100%" height="600px"/>`

#### Source Reporting:
- Special page: `Special:ReportSource`
- Database table: `reported_sources`
- Automatic alerts on pages with reported sources
- Reasons: "outdated" or "false"

### 4. **LaTeX Math**
- Uses MediaWiki's built-in Math extension
- Inline: `<math>E = mc^2</math>`
- Display: `<math>\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}</math>`

## 📝 Syntax Differences

### Old JavaScript App (Bracket Syntax):
```
[color:red]text[/color]
[size:large]text[/size]
[manim:code]...[/manim]
[interactive:code]...[/interactive]
[embed:url|width|height]
```

### New MediaWiki (XML Syntax):
```xml
<color value="red">text</color>
<size value="large">text</size>
<manim>code</manim>
<interactive>code</interactive>
<embed url="https://example.com" width="100%" height="600px"/>
```

## 🗑️ Removed Files

The following old files have been deleted (no longer needed):
- `app.js` - Original JavaScript application
- `index.html` - Original HTML interface
- `style.css` - Original CSS styles

## 📦 Files Kept

- `export-data.html` - Tool to export data from browser localStorage
- `migrate-to-mediawiki.php` - Migration script
- `setup-database.sql` - Database schema
- All MediaWiki extensions and configuration

## 🚀 Next Steps

1. Export your data using `export-data.html`
2. Run migration: `php migrate-to-mediawiki.php data-export.json`
3. Start using MediaWiki with all custom features!

## 📚 Documentation

- See `MIGRATION_GUIDE.md` for detailed migration instructions
- See `IMPLEMENTATION_SUMMARY.md` for technical details
- See `MEDIAWIKI_SETUP.md` for setup instructions

