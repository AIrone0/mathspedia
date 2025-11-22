<?php
/**
 * Mathspedia Authority System
 * 
 * Implements authority-based editing restrictions based on user ranks
 */

class MathspediaAuthority {
	
	// Rank hierarchy (higher number = higher authority)
	const RANK_HIERARCHY = [
		'math_enjoyer' => 1,
		'undergraduate' => 2,
		'graduate' => 3,
		'math_teacher' => 4,
		'phd' => 5,
		'professor' => 6
	];
	
	/**
	 * Get user's authority rank
	 */
	public static function getUserRank(User $user) {
		$rank = $user->getOption('mathspedia_rank', 'math_enjoyer');
		return $rank;
	}
	
	/**
	 * Get rank hierarchy value
	 */
	public static function getRankValue($rank) {
		return self::RANK_HIERARCHY[$rank] ?? 1;
	}
	
	/**
	 * Check if user can edit a page based on authority
	 */
	public static function canEdit(User $user, Title $title) {
		$services = \MediaWiki\MediaWikiServices::getInstance();
		$pageProps = $services->getPageProps();
		
		// Get the author rank of the page
		$props = $pageProps->getProperties($title, 'mathspedia_author_rank');
		$pageId = $title->getArticleID();
		$authorRank = $props[$pageId] ?? null;
		
		if (!$authorRank) {
			// No author rank set, allow editing
			return true;
		}
		
		$userRank = self::getUserRank($user);
		$userRankValue = self::getRankValue($userRank);
		$authorRankValue = self::getRankValue($authorRank);
		
		// User can edit if their rank is equal or higher
		return $userRankValue >= $authorRankValue;
	}
	
	/**
	 * Set user's rank
	 */
	public static function setUserRank(User $user, $rank) {
		if (!isset(self::RANK_HIERARCHY[$rank])) {
			return false;
		}
		
		$user->setOption('mathspedia_rank', $rank);
		$user->saveSettings();
		return true;
	}
	
	/**
	 * Get all available ranks
	 */
	public static function getAvailableRanks() {
		return array_keys(self::RANK_HIERARCHY);
	}
}

