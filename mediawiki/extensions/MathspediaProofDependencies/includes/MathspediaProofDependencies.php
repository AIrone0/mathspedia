<?php
/**
 * Core logic for building proof dependency trees
 */

class MathspediaProofDependencies {
	
	/**
	 * Extract requisites from a page
	 * Returns array of page titles that are prerequisites
	 */
	public static function getRequisites($pageTitle) {
		$title = \Title::newFromText($pageTitle);
		if (!$title || !$title->exists()) {
			return [];
		}
		
		$services = \MediaWiki\MediaWikiServices::getInstance();
		$wikiPageFactory = $services->getWikiPageFactory();
		$page = $wikiPageFactory->newFromTitle($title);
		
		$revisionStore = $services->getRevisionStore();
		$revision = $revisionStore->getRevisionByTitle($title);
		
		if (!$revision) {
			return [];
		}
		
		$content = $revision->getContent(\MediaWiki\Revision\SlotRecord::MAIN);
		if (!$content) {
			return [];
		}
		
		$text = $content->getText();
		
		// Find "== Requisites ==" section
		if (!preg_match('/^==+\s*Requisites\s*==+\s*$/m', $text, $match, PREG_OFFSET_CAPTURE)) {
			return [];
		}
		
		$startPos = $match[0][1] + strlen($match[0][0]);
		
		// Find next section or end of text
		$endPos = strlen($text);
		if (preg_match('/^==+\s*\w+/m', $text, $nextMatch, PREG_OFFSET_CAPTURE, $startPos)) {
			$endPos = $nextMatch[0][1];
		}
		
		$section = substr($text, $startPos, $endPos - $startPos);
		
		// Extract [[Page Name]] links
		preg_match_all('/\[\[([^\|\]]+)(?:\|[^\]]+)?\]\]/', $section, $matches);
		
		$requisites = [];
		foreach ($matches[1] as $link) {
			$link = trim($link);
			if ($link) {
				$requisites[] = $link;
			}
		}
		
		return $requisites;
	}
	
	/**
	 * Build complete dependency tree
	 * Returns: ['nodes' => [...], 'edges' => [...]]
	 */
	public static function buildTree($startProof, $maxDepth = 0) {
		$nodes = [];
		$edges = [];
		$visited = [];
		
		self::buildTreeRecursive($startProof, $nodes, $edges, $visited, 0, $maxDepth);
		
		return [
			'nodes' => array_values($nodes),
			'edges' => $edges
		];
	}
	
	private static function buildTreeRecursive($proof, &$nodes, &$edges, &$visited, $depth, $maxDepth) {
		// Check if already visited (cycle detection)
		if (isset($visited[$proof])) {
			return;
		}
		
		// Check depth limit
		if ($maxDepth > 0 && $depth >= $maxDepth) {
			return;
		}
		
		$visited[$proof] = true;
		
		// Check if page exists
		$title = \Title::newFromText($proof);
		if (!$title || !$title->exists()) {
			return;
		}
		
		// Add node
		$nodeId = self::sanitizeId($proof);
		$nodes[$nodeId] = [
			'id' => $nodeId,
			'label' => $proof,
			'url' => $title->getLocalURL()
		];
		
		// Get prerequisites
		$requisites = self::getRequisites($proof);
		
		// Add edges and recurse
		foreach ($requisites as $req) {
			$reqTitle = \Title::newFromText($req);
			if ($reqTitle && $reqTitle->exists()) {
				$reqId = self::sanitizeId($req);
				
				// Add edge: prerequisite -> proof
				$edges[] = [
					'from' => $reqId,
					'to' => $nodeId
				];
				
				// Recurse into prerequisite
				self::buildTreeRecursive($req, $nodes, $edges, $visited, $depth + 1, $maxDepth);
			}
		}
	}
	
	/**
	 * Sanitize page name to use as node ID
	 */
	private static function sanitizeId($name) {
		$id = preg_replace('/[^a-zA-Z0-9_]/', '_', $name);
		$id = preg_replace('/_+/', '_', $id);
		$id = trim($id, '_');
		return $id ?: 'node_' . md5($name);
	}
	
	/**
	 * Generate Mermaid.js graph code
	 */
	public static function generateMermaid($tree) {
		$nodes = $tree['nodes'];
		$edges = $tree['edges'];
		
		if (empty($nodes)) {
			return '';
		}
		
		// Horizontal layout
		$mermaid = "graph LR\n";
		
		// Add all nodes
		foreach ($nodes as $node) {
			$label = str_replace('"', '\\"', $node['label']);
			$mermaid .= "    {$node['id']}[\"{$label}\"]\n";
		}
		
		// Add click handlers
		foreach ($nodes as $node) {
			$url = str_replace('"', '\\"', $node['url']);
			$mermaid .= "    click {$node['id']} \"{$url}\"\n";
		}
		
		// Add edges
		foreach ($edges as $edge) {
			$mermaid .= "    {$edge['from']} --> {$edge['to']}\n";
		}
		
		return $mermaid;
	}
}
