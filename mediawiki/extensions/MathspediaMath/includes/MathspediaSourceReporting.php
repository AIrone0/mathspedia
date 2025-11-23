<?php
/**
 * Source reporting functionality
 */

class MathspediaSourceReporting {
	
	/**
	 * Check if a source is reported
	 */
	public static function isSourceReported($source) {
		$dbr = wfGetDB(DB_REPLICA);
		$row = $dbr->selectRow(
			'reported_sources',
			'rs_reason',
			[
				'rs_source' => $source,
				'rs_resolved' => 0
			],
			__METHOD__
		);
		
		return $row ? $row->rs_reason : false;
	}
	
	/**
	 * Get all reported sources for a page
	 */
	public static function getReportedSourcesForPage($title) {
		// Extract references from page content
		$services = \MediaWiki\MediaWikiServices::getInstance();
		$page = $services->getWikiPageFactory()->newFromTitle($title);
		if (!$page || !$page->exists()) {
			return [];
		}
		
		$revisionRecord = $services->getRevisionStore()->getRevisionByTitle($title);
		if (!$revisionRecord) {
			return [];
		}
		
		$content = $revisionRecord->getContent(\MediaWiki\Revision\SlotRecord::MAIN);
		if (!$content) {
			return [];
		}
		
		$text = $content->getText();
		
		// Extract <ref> tags
		preg_match_all('/<ref>(.*?)<\/ref>/s', $text, $matches);
		$references = $matches[1] ?? [];
		
		$reported = [];
		foreach ($references as $ref) {
			$ref = trim(strip_tags($ref));
			if (self::isSourceReported($ref)) {
				$reported[] = $ref;
			}
		}
		
		return $reported;
	}
}

