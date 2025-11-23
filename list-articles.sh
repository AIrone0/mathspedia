#!/usr/bin/env bash

# List all articles in the MediaWiki database

cd "$(dirname "$0")"

echo "=== Articles in Mathspedia Database ==="
echo ""

# Try to connect and list articles
mysql -S .mysql.sock -u root wikidb -e "
SELECT 
    page_id as 'ID',
    page_title as 'Article Title',
    (SELECT COUNT(*) FROM revision WHERE rev_page = page_id) as 'Revisions'
FROM page 
WHERE page_namespace = 0 
ORDER BY page_id;
" 2>/dev/null || {
    echo "Could not connect to database."
    echo "Make sure you're in nix-shell and MariaDB is running."
    echo ""
    echo "To check articles via MediaWiki API, start the server and visit:"
    echo "http://localhost:8080/api.php?action=query&list=allpages&format=json"
}

