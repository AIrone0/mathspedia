<?php
/**
 * Migration script to transfer articles from the old localStorage-based system to MediaWiki
 * 
 * Usage:
 * 1. Export localStorage data from browser console:
 *    JSON.stringify({
 *      articles: JSON.parse(localStorage.getItem('articles')),
 *      users: JSON.parse(localStorage.getItem('users')),
 *      abTests: JSON.parse(localStorage.getItem('abTests')),
 *      reportedSources: JSON.parse(localStorage.getItem('reportedSources'))
 *    })
 * 2. Save to data-export.json
 * 3. Run: php migrate-to-mediawiki.php data-export.json
 */

require_once __DIR__ . '/mediawiki/includes/WebStart.php';

use MediaWiki\MediaWikiServices;

if (php_sapi_name() !== 'cli') {
    die("This script must be run from the command line.\n");
}

if ($argc < 2) {
    die("Usage: php migrate-to-mediawiki.php <data-export.json>\n");
}

$dataFile = $argv[1];
if (!file_exists($dataFile)) {
    die("Error: Data file '$dataFile' not found.\n");
}

$data = json_decode(file_get_contents($dataFile), true);
if (!$data) {
    die("Error: Invalid JSON in data file.\n");
}

echo "Starting migration...\n";

$userFactory = MediaWikiServices::getInstance()->getUserFactory();
$wikiPageFactory = MediaWikiServices::getInstance()->getWikiPageFactory();
$revisionStore = MediaWikiServices::getInstance()->getRevisionStore();

// Rank mapping
$rankMapping = [
    'math_enjoyer' => 1,
    'undergraduate' => 2,
    'graduate' => 3,
    'math_teacher' => 4,
    'phd' => 5,
    'professor' => 6
];

// Create users first
if (isset($data['users'])) {
    echo "Creating users...\n";
    foreach ($data['users'] as $username => $userData) {
        $user = $userFactory->newFromName($username);
        if (!$user || !$user->getId()) {
            $user = $userFactory->newFromName($username, 'creatable');
            if (!$user) {
                echo "  Warning: Could not create user '$username'\n";
                continue;
            }
        }
        
        // Set user properties (rank will be stored in user properties)
        $user->setOption('mathspedia_rank', $userData['rank'] ?? 'math_enjoyer');
        $user->saveSettings();
        
        echo "  Created/updated user: $username (rank: " . ($userData['rank'] ?? 'math_enjoyer') . ")\n";
    }
}

// Migrate articles
if (isset($data['articles'])) {
    echo "\nMigrating articles...\n";
    $count = 0;
    
    foreach ($data['articles'] as $title => $article) {
        $titleObj = Title::newFromText($title);
        if (!$titleObj) {
            echo "  Warning: Invalid title '$title', skipping\n";
            continue;
        }
        
        $page = $wikiPageFactory->newFromTitle($titleObj);
        
        // Build MediaWiki wikitext from article content
        $wikitext = buildWikitext($article);
        
        // Get author user
        $author = null;
        if (isset($article['author'])) {
            $author = $userFactory->newFromName($article['author']);
        }
        if (!$author || !$author->getId()) {
            $author = $userFactory->newFromName('Admin'); // Fallback to admin
        }
        
        // Create/update page
        $content = new WikitextContent($wikitext);
        $updater = $page->newPageUpdater($author);
        $updater->setContent('main', $content);
        
        $comment = CommentStoreComment::newUnsavedComment(
            "Migrated from localStorage-based system"
        );
        
        $updater->saveRevision($comment);
        
        // Store metadata in page properties
        if (isset($article['authorRank'])) {
            $page->setProperty('mathspedia_author_rank', $article['authorRank']);
        }
        if (isset($article['isTheorem']) && $article['isTheorem']) {
            $page->setProperty('mathspedia_is_theorem', '1');
        }
        
        $count++;
        echo "  Migrated: $title\n";
    }
    
    echo "\nMigrated $count articles.\n";
}

// Store A/B tests and reported sources as special pages or in database
if (isset($data['abTests'])) {
    echo "\nStoring A/B test data...\n";
    // A/B tests will be handled by the A/B testing extension
    file_put_contents(__DIR__ . '/mediawiki/ab-tests-backup.json', json_encode($data['abTests'], JSON_PRETTY_PRINT));
    echo "  A/B test data saved to ab-tests-backup.json\n";
}

if (isset($data['reportedSources'])) {
    echo "\nStoring reported sources data...\n";
    file_put_contents(__DIR__ . '/mediawiki/reported-sources-backup.json', json_encode($data['reportedSources'], JSON_PRETTY_PRINT));
    echo "  Reported sources data saved to reported-sources-backup.json\n";
}

echo "\nMigration complete!\n";

/**
 * Convert article data structure to MediaWiki wikitext
 */
function buildWikitext($article) {
    $text = "";
    
    // Introduction
    if (!empty($article['content']['introduction'])) {
        $text .= $article['content']['introduction'] . "\n\n";
    }
    
    // Main content
    if (!empty($article['content']['mainContent'])) {
        $text .= "== Main Content ==\n";
        $text .= $article['content']['mainContent'] . "\n\n";
    }
    
    // Theorem-specific sections
    if (isset($article['isTheorem']) && $article['isTheorem']) {
        if (!empty($article['content']['history'])) {
            $text .= "== History ==\n";
            $text .= $article['content']['history'] . "\n\n";
        }
        
        if (!empty($article['content']['applications'])) {
            $text .= "== Applications ==\n";
            $text .= $article['content']['applications'] . "\n\n";
        }
        
        if (!empty($article['content']['relatedConcepts'])) {
            $text .= "== Related Concepts ==\n";
            $text .= $article['content']['relatedConcepts'] . "\n\n";
        }
        
        if (!empty($article['content']['seeAlso']) && is_array($article['content']['seeAlso'])) {
            $text .= "== See Also ==\n";
            foreach ($article['content']['seeAlso'] as $item) {
                $text .= "* [[$item]]\n";
            }
            $text .= "\n";
        }
    }
    
    // References
    if (!empty($article['references']) && is_array($article['references'])) {
        $text .= "== References ==\n";
        foreach ($article['references'] as $i => $ref) {
            $text .= "<ref>" . htmlspecialchars($ref) . "</ref>\n";
        }
        $text .= "\n";
    }
    
    // Further Reading
    if (!empty($article['furtherReading']) && is_array($article['furtherReading'])) {
        $text .= "== Further Reading ==\n";
        foreach ($article['furtherReading'] as $item) {
            $text .= "* " . htmlspecialchars($item) . "\n";
        }
        $text .= "\n";
    }
    
    // External Links
    if (!empty($article['externalLinks']) && is_array($article['externalLinks'])) {
        $text .= "== External Links ==\n";
        foreach ($article['externalLinks'] as $link) {
            $text .= "* [{$link} {$link}]\n";
        }
        $text .= "\n";
    }
    
    // Categories
    if (isset($article['isTheorem']) && $article['isTheorem']) {
        $text .= "[[Category:Theorems]]\n";
    }
    $text .= "[[Category:Mathematics]]\n";
    
    return $text;
}

