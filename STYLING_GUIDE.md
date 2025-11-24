# MediaWiki Styling Guide

## Official Method: Using MediaWiki Namespace Pages

According to MediaWiki documentation, you should customize styles by editing special wiki pages in the `MediaWiki:` namespace. These pages are automatically loaded by MediaWiki's ResourceLoader.

### Available CSS Pages

1. **`MediaWiki:Common.css`** - Site-wide CSS (applies to all skins)
2. **`MediaWiki:Vector.css`** - Vector skin-specific CSS
3. **`MediaWiki:Print.css`** - Print stylesheet
4. **`MediaWiki:Common.js`** - Site-wide JavaScript
5. **`MediaWiki:Vector.js`** - Vector skin-specific JavaScript

### How to Access These Pages

1. **Via URL:**
   - Common.css: `http://localhost:8080/index.php?title=MediaWiki:Common.css`
   - Vector.css: `http://localhost:8080/index.php?title=MediaWiki:Vector.css`

2. **Via Search:**
   - Go to your wiki
   - Search for "MediaWiki:Common.css" or "MediaWiki:Vector.css"
   - Click "Edit" to modify

3. **Direct Edit Link:**
   - You need to be logged in as an administrator or have the `editinterface` permission

### Example CSS Customizations

#### Common.css Examples

```css
/* Change main content background color */
.mw-body-content {
    background-color: #f9f9f9;
}

/* Customize link colors */
a {
    color: #0645ad;
}

a:visited {
    color: #0b0080;
}

a:hover {
    color: #06e;
}

/* Customize heading styles */
.mw-body-content h1,
.mw-body-content h2 {
    border-bottom: 2px solid #a7d7f9;
    padding-bottom: 0.3em;
}

/* Customize table of contents */
#toc {
    background-color: #f8f9fa;
    border: 1px solid #a7d7f9;
    border-radius: 4px;
    padding: 1em;
}
```

#### Vector.css Examples

```css
/* Customize Vector skin header */
.vector-header-container {
    background-color: #2c3e50;
}

/* Customize sidebar */
.vector-sidebar {
    background-color: #34495e;
}

/* Customize navigation links */
.vector-menu-portal .vector-menu-content-list li a {
    color: #ecf0f1;
}

/* Customize search box */
.vector-search-box {
    border-radius: 20px;
}
```

### User-Specific Styles

Users can also create their own styles:
- `User:YourUsername/common.css` - User-specific CSS for all skins
- `User:YourUsername/vector.css` - User-specific CSS for Vector skin

### Important Notes

1. **Permissions Required:**
   - To edit `MediaWiki:*` pages, you need the `editinterface` permission
   - By default, only administrators have this permission

2. **Caching:**
   - CSS changes may be cached by ResourceLoader
   - Clear your browser cache or add `?action=purge` to the page URL

3. **Best Practices:**
   - Use `Common.css` for styles that should apply to all skins
   - Use skin-specific CSS files (like `Vector.css`) for skin-specific customizations
   - Test changes on a development wiki first
   - Keep CSS organized with comments

### Enabling Custom CSS/JS

Make sure these settings are enabled in `LocalSettings.php`:

```php
# Enable site-wide CSS/JS (usually enabled by default)
$wgUseSiteCss = true;
$wgUseSiteJs = true;

# Enable user-specific CSS/JS (usually enabled by default)
$wgAllowUserCss = true;
$wgAllowUserJs = true;
```

### Alternative: Direct File Editing (Not Recommended)

While you *could* edit the skin files directly in `mediawiki/skins/Vector/resources/`, this is **NOT recommended** because:
- Changes will be lost when you update MediaWiki
- It's harder to maintain
- It doesn't follow MediaWiki best practices

The official method (editing MediaWiki namespace pages) is preferred because:
- Changes persist through MediaWiki updates
- Easier to manage through the web interface
- Can be version controlled through MediaWiki's history
- Can be protected with page protection

### Resources

- [MediaWiki Manual: Interface/Stylesheets](https://www.mediawiki.org/wiki/Manual:Interface/Stylesheets)
- [MediaWiki Manual: Skinning](https://www.mediawiki.org/wiki/Manual:Skinning)
- [Vector Skin Documentation](https://www.mediawiki.org/wiki/Skin:Vector)

