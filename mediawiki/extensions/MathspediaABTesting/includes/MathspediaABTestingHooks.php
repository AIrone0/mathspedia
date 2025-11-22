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
		$currentAuthorRank = $wikiPage->getProperty('mathspedia_author_rank');
		$userRank = MathspediaAuthority::getUserRank($user);
		
		// If same rank, create A/B test
		if ($currentAuthorRank && $currentAuthorRank === $userRank && $user->getName() !== $wikiPage->getCreator()->getName()) {
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

