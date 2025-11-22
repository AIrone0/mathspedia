<?php
/**
 * Hooks for MathspediaAuthority extension
 */

class MathspediaAuthorityHooks {
	
	/**
	 * Hook: userCan
	 * Restrict editing based on authority
	 */
	public static function onUserCan($title, $user, $action, &$result) {
		global $wgMathspediaAuthorityEnabled;
		
		if (!$wgMathspediaAuthorityEnabled) {
			return true;
		}
		
		// Only restrict edit action
		if ($action !== 'edit') {
			return true;
		}
		
		// Allow sysops to edit anything
		if ($user->isAllowed('edit')) {
			return true;
		}
		
		// Check authority
		if (!MathspediaAuthority::canEdit($user, $title)) {
			$result = false;
			return false;
		}
		
		return true;
	}
	
	/**
	 * Hook: PageSaveComplete
	 * Store author rank when page is saved
	 */
	public static function onPageSaveComplete($wikiPage, $user, $summary, $flags, $revisionRecord, $editResult) {
		$rank = MathspediaAuthority::getUserRank($user);
		$wikiPage->setProperty('mathspedia_author_rank', $rank);
		
		return true;
	}
	
	/**
	 * Hook: BeforePageDisplay
	 * Show authority information on pages
	 */
	public static function onBeforePageDisplay($out, $skin) {
		$title = $out->getTitle();
		$page = \MediaWiki\MediaWikiServices::getInstance()->getWikiPageFactory()->newFromTitle($title);
		
		$authorRank = $page->getProperty('mathspedia_author_rank');
		if ($authorRank) {
			$rankDisplay = ucfirst(str_replace('_', ' ', $authorRank));
			$out->addSubtitle("<span class='mathspedia-author-rank'>Author rank: $rankDisplay</span>");
		}
		
		return true;
	}
}

