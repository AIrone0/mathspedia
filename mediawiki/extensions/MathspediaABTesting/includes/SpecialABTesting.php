<?php
/**
 * Special page for viewing and managing A/B tests
 */

require_once __DIR__ . '/MathspediaABTesting.php';

class SpecialABTesting extends SpecialPage {
	
	public function __construct() {
		parent::__construct('ABTesting');
	}
	
	public function execute($par) {
		$this->setHeaders();
		
		$request = $this->getRequest();
		$pageTitle = $par ?? $request->getVal('page');
		
		if (!$pageTitle) {
			$this->getOutput()->addWikiTextAsInterface("== A/B Testing ==\n\nPlease specify a page title.");
			return;
		}
		
		$title = Title::newFromText($pageTitle);
		if (!$title) {
			$this->getOutput()->addWikiTextAsInterface("Invalid page title: $pageTitle");
			return;
		}
		
		$versions = MathspediaABTesting::getABTestVersions($title->getPrefixedText());
		
		if (empty($versions)) {
			$this->getOutput()->addWikiTextAsInterface("No A/B test versions found for [[$pageTitle]].");
			return;
		}
		
		$this->getOutput()->addWikiTextAsInterface("== A/B Test Versions for [[$pageTitle]] ==\n");
		
		foreach ($versions as $i => $version) {
			$num = $i + 1;
			$this->getOutput()->addWikiTextAsInterface("=== Version $num ===\n");
			$this->getOutput()->addWikiTextAsInterface("* Author: {$version['author']} (Rank: {$version['rank']})\n");
			$this->getOutput()->addWikiTextAsInterface("* Summary: {$version['summary']}\n");
			$this->getOutput()->addWikiTextAsInterface("* Timestamp: {$version['timestamp']}\n");
			
			if (!empty($version['feedback'])) {
				$this->getOutput()->addWikiTextAsInterface("* Feedback: " . count($version['feedback']) . " review(s)\n");
			}
			
			// Show content diff or preview
			$this->getOutput()->addHTML("<div class='ab-version-content'><pre>" . htmlspecialchars(substr($version['content'], 0, 500)) . "...</pre></div>");
		}
		
		// Feedback form
		$user = $this->getUser();
		if ($user->isRegistered()) {
			$this->showFeedbackForm($versions);
		}
	}
	
	private function showFeedbackForm($versions) {
		$output = $this->getOutput();
		$output->addHTML('<form method="post" action="' . $this->getPageTitle()->getLocalURL() . '">');
		$output->addHTML('<h3>Submit Feedback</h3>');
		$output->addHTML('<select name="version_id">');
		foreach ($versions as $version) {
			$output->addHTML("<option value='{$version['id']}'>Version by {$version['author']}</option>");
		}
		$output->addHTML('</select>');
		$output->addHTML('<label>Helpfulness (1-5): <input type="number" name="helpfulness" min="1" max="5" required></label>');
		$output->addHTML('<button type="submit">Submit Feedback</button>');
		$output->addHTML('</form>');
	}
}

