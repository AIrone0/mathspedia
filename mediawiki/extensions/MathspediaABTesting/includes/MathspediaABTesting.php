<?php
/**
 * Mathspedia A/B Testing System
 * 
 * Handles A/B testing when users of the same rank have conflicting edits
 */

require_once __DIR__ . '/../../MathspediaAuthority/includes/MathspediaAuthority.php';

class MathspediaABTesting {
	
	/**
	 * Create an A/B test version
	 */
	public static function createABTest($title, $user, $content, $summary) {
		$dbr = wfGetDB(DB_REPLICA);
		
		// Get current author rank
		$titleObj = Title::newFromText($title);
		if (!$titleObj) {
			return false;
		}
		
		$services = \MediaWiki\MediaWikiServices::getInstance();
		$pageProps = $services->getPageProps();
		$props = $pageProps->getProperties($titleObj, 'mathspedia_author_rank');
		$pageId = $titleObj->getArticleID();
		$currentAuthorRank = $props[$pageId] ?? null;
		
		$userRank = MathspediaAuthority::getUserRank($user);
		
		// Only create A/B test if ranks are equal
		if ($currentAuthorRank !== $userRank) {
			return false;
		}
		
		// Store A/B test version
		$dbw = wfGetDB(DB_PRIMARY);
		$dbw->insert(
			'ab_test_versions',
			[
				'abt_page' => $title,
				'abt_author' => $user->getName(),
				'abt_rank' => $userRank,
				'abt_content' => $content,
				'abt_summary' => $summary,
				'abt_timestamp' => $dbw->timestamp(),
				'abt_feedback' => json_encode([])
			],
			__METHOD__
		);
		
		return $dbw->insertId();
	}
	
	/**
	 * Get A/B test versions for a page
	 */
	public static function getABTestVersions($title) {
		$dbr = wfGetDB(DB_REPLICA);
		
		$res = $dbr->select(
			'ab_test_versions',
			'*',
			['abt_page' => $title],
			__METHOD__,
			['ORDER BY' => 'abt_timestamp DESC']
		);
		
		$versions = [];
		foreach ($res as $row) {
			$versions[] = [
				'id' => $row->abt_id,
				'author' => $row->abt_author,
				'rank' => $row->abt_rank,
				'content' => $row->abt_content,
				'summary' => $row->abt_summary,
				'timestamp' => $row->abt_timestamp,
				'feedback' => json_decode($row->abt_feedback, true) ?? []
			];
		}
		
		return $versions;
	}
	
	/**
	 * Submit feedback for an A/B test version
	 */
	public static function submitFeedback($versionId, $user, $rank, $helpfulness) {
		$dbw = wfGetDB(DB_PRIMARY);
		
		// Get current feedback
		$row = $dbw->selectRow(
			'ab_test_versions',
			'abt_feedback',
			['abt_id' => $versionId],
			__METHOD__
		);
		
		$feedback = json_decode($row->abt_feedback ?? '[]', true);
		$feedback[] = [
			'user' => $user->getName(),
			'rank' => $rank,
			'helpfulness' => (int)$helpfulness,
			'timestamp' => $dbw->timestamp()
		];
		
		// Update feedback
		$dbw->update(
			'ab_test_versions',
			['abt_feedback' => json_encode($feedback)],
			['abt_id' => $versionId],
			__METHOD__
		);
		
		return true;
	}
	
	/**
	 * Get the best version based on feedback
	 */
	public static function getBestVersion($title) {
		$versions = self::getABTestVersions($title);
		
		if (empty($versions)) {
			return null;
		}
		
		// Calculate score for each version
		$scores = [];
		foreach ($versions as $version) {
			$score = 0;
			$rankWeights = [
				'math_enjoyer' => 1,
				'undergraduate' => 2,
				'graduate' => 3,
				'math_teacher' => 4,
				'phd' => 5,
				'professor' => 6
			];
			
			foreach ($version['feedback'] as $feedback) {
				$weight = $rankWeights[$feedback['rank']] ?? 1;
				$score += $feedback['helpfulness'] * $weight;
			}
			
			$scores[$version['id']] = $score;
		}
		
		// Return version with highest score
		arsort($scores);
		$bestId = key($scores);
		
		foreach ($versions as $version) {
			if ($version['id'] == $bestId) {
				return $version;
			}
		}
		
		return $versions[0]; // Fallback to first version
	}
}