<?php
/**
 * Hooks for MathspediaABTesting extension
 */

class MathspediaABTestingHooks {
	
	/**
	 * Hook: PageSaveComplete
	 * Check if we need to create an A/B test
	 */
	public static function onPageSaveComplete($wikiPage, $user, $summary, $flags, $revisionRecord, $editResult) {
		$title = $wikiPage->getTitle();
		
		// Get current author rank from page properties
		$services = \MediaWiki\MediaWikiServices::getInstance();
		$pageProps = $services->getPageProps();
		$props = $pageProps->getProperties($title, 'mathspedia_author_rank');
		$pageId = $title->getArticleID();
		$currentAuthorRank = $props[$pageId] ?? null;
		
		$userRank = MathspediaAuthority::getUserRank($user);
		
		// Get creator
		$creator = $wikiPage->getCreator();
		$creatorName = $creator ? $creator->getName() : null;
		
		// If same rank and different user, create A/B test
		if ($currentAuthorRank && $currentAuthorRank === $userRank && $user->getName() !== $creatorName) {
			$content = $revisionRecord->getContent('main');
			$text = $content ? $content->getText() : '';
			
			MathspediaABTesting::createABTest($title->getPrefixedText(), $user, $text, $summary);
		}
		
		return true;
	}
	
	/**
	 * Hook: BeforePageDisplay
	 * Show A/B test notice if versions exist
	 */
	public static function onBeforePageDisplay($out, $skin) {
		$title = $out->getTitle();
		$versions = MathspediaABTesting::getABTestVersions($title->getPrefixedText());
		
		if (!empty($versions)) {
			$out->addHTML('<div class="mathspedia-ab-notice">' .
				'<strong>A/B Test Available:</strong> ' .
				'<a href="' . SpecialPage::getTitleFor('ABTesting', $title->getPrefixedText())->getFullURL() . '">' .
				'Compare ' . count($versions) . ' version(s)</a>' .
				'</div>');
		}
		
		return true;
	}
}

