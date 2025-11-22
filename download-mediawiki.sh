#!/usr/bin/env bash

# Download and extract MediaWiki
MEDIAWIKI_VERSION="1.41.1"
MEDIAWIKI_URL="https://releases.wikimedia.org/mediawiki/1.41/mediawiki-${MEDIAWIKI_VERSION}.tar.gz"

echo "Downloading MediaWiki ${MEDIAWIKI_VERSION}..."
wget -O mediawiki.tar.gz "${MEDIAWIKI_URL}"

echo "Extracting MediaWiki..."
tar -xzf mediawiki.tar.gz
mv mediawiki-${MEDIAWIKI_VERSION} mediawiki
rm mediawiki.tar.gz

echo "MediaWiki downloaded to ./mediawiki"
echo "Next steps:"
echo "1. Start MariaDB (if not running): mysqld_safe --datadir=\$PWD/.mysql-data --socket=\$PWD/.mysql.sock &"
echo "2. Create database: mysql -u root -e 'CREATE DATABASE wikidb;'"
echo "3. Start PHP server: cd mediawiki && php -S localhost:8080"
echo "4. Open http://localhost:8080 in your browser to run the installer"

