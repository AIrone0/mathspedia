<?php
/**
 * Special page for proof dependency visualization
 */

class SpecialProofDependencies extends SpecialPage {
	
	public function __construct() {
		parent::__construct('ProofDependencies');
	}
	
	public function execute($par) {
		$this->setHeaders();
		$output = $this->getOutput();
		$request = $this->getRequest();
		
		// Add CSS and JS
		$output->addModules('ext.mathspediaProofDependencies');
		
		$proofName = $par ?? $request->getVal('proof', '');
		
		// Page title
		$output->addHTML('<h2>Proof Dependency Visualizer</h2>');
		$output->addHTML('<p>Visualize the dependency tree for mathematical proofs.</p>');
		
		// Simple HTML form
		$output->addHTML($this->buildForm($proofName));
		
		// Graph container
		$output->addHTML('<div id="proof-graph"></div>');
		
		// Generate graph if proof provided
		if ($proofName) {
			$maxDepth = (int)$request->getVal('maxdepth', 0);
			
			$tree = MathspediaProofDependencies::buildTree($proofName, $maxDepth);
			$mermaid = MathspediaProofDependencies::generateMermaid($tree);
			
			$output->addInlineScript(
				'window.proofData = ' . json_encode([
					'proof' => $proofName,
					'mermaid' => $mermaid,
					'nodeCount' => count($tree['nodes']),
					'edgeCount' => count($tree['edges'])
				]) . ';'
			);
		}
	}
	
	private function buildForm($defaultProof) {
		$action = $this->getPageTitle()->getLocalURL();
		
		$html = '<form method="get" action="' . htmlspecialchars($action) . '" id="proof-form">';
		$html .= '<input type="hidden" name="title" value="Special:ProofDependencies" />';
		
		$html .= '<div style="margin: 1em 0;">';
		$html .= '<label for="proof-input">Proof Name:</label><br/>';
		$html .= '<input type="text" id="proof-input" name="proof" value="' . htmlspecialchars($defaultProof) . '" style="width: 400px; padding: 0.5em;" required />';
		$html .= '</div>';
		
		$html .= '<div style="margin: 1em 0;">';
		$html .= '<label for="depth-input">Max Depth (0 = unlimited):</label><br/>';
		$html .= '<input type="number" id="depth-input" name="maxdepth" value="0" min="0" style="width: 100px; padding: 0.5em;" />';
		$html .= '</div>';
		
		$html .= '<button type="submit" style="padding: 0.5em 2em; font-size: 1em;">Visualize</button>';
		$html .= '</form>';
		
		return $html;
	}
	
	protected function getGroupName() {
		return 'mathspedia';
	}
}
