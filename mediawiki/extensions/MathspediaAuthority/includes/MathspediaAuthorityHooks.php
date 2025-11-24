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
		
		// If user doesn't have basic edit permission, don't interfere
		// (MediaWiki will handle that restriction)
		if (!$user->isAllowed('edit')) {
			return true;
		}
		
		// Check authority - this adds additional restrictions based on rank
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
		$title = $wikiPage->getTitle();
		
		// Set page property via ParserOutput
		$services = \MediaWiki\MediaWikiServices::getInstance();
		$parserOutput = $services->getParserOutputAccess()->getCachedParserOutput($title, $revisionRecord);
		if ($parserOutput) {
			$parserOutput->setPageProperty('mathspedia_author_rank', $rank);
		}
		
		// Also store directly in page_props table
		$dbw = wfGetDB(DB_PRIMARY);
		$pageId = $title->getArticleID();
		$dbw->replace(
			'page_props',
			[['pp_page', 'pp_propname']],
			[
				'pp_page' => $pageId,
				'pp_propname' => 'mathspedia_author_rank',
				'pp_value' => $rank
			],
			__METHOD__
		);
		
		return true;
	}
	
	/**
	 * Hook: BeforePageDisplay
	 * Show authority information on pages
	 */
	public static function onBeforePageDisplay($out, $skin) {
		$title = $out->getTitle();
		if (!$title || !$title->exists()) {
			return true;
		}
		
		$services = \MediaWiki\MediaWikiServices::getInstance();
		$pageProps = $services->getPageProps();
		
		$props = $pageProps->getProperties($title, 'mathspedia_author_rank');
		$pageId = $title->getArticleID();
		$authorRank = $props[$pageId] ?? null;
		
		if ($authorRank) {
			$rankDisplay = ucfirst(str_replace('_', ' ', $authorRank));
			$out->addSubtitle("<span class='mathspedia-author-rank'>Author rank: $rankDisplay</span>");
		}
		
		return true;
	}
}

