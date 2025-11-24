<?php
/**
 * Hooks for MathspediaProofDependencies extension
 */

class MathspediaProofDependenciesHooks {
	
	/**
	 * Hook: BeforePageDisplay
	 * Add link to Proof Dependencies on the main page
	 */
	public static function onBeforePageDisplay($out, $skin) {
		$title = $out->getTitle();
		
		// Check if we're on the main page
		if ($title && $title->isMainPage()) {
			$specialPage = \SpecialPage::getTitleFor('ProofDependencies');
			$linkUrl = $specialPage->getLocalURL();
			$linkText = wfMessage('proofdependencies')->text();
			
			// Add a prominent link box at the top of the main page
			$linkHTML = '<div class="proof-deps-main-page-link" style="background: #e8f4f8; border: 2px solid #36c; border-radius: 8px; padding: 1em; margin: 1em 0; text-align: center;">' .
				'<h3 style="margin-top: 0; color: #36c;">🔗 Proof Dependency Visualizer</h3>' .
				'<p style="margin: 0.5em 0;">Explore the dependencies between mathematical proofs and visualize their relationships.</p>' .
				'<a href="' . htmlspecialchars($linkUrl) . '" class="mw-ui-button mw-ui-progressive" style="display: inline-block; margin-top: 0.5em;">' .
				htmlspecialchars($linkText) .
				'</a>' .
				'</div>';
			
			$out->prependHTML($linkHTML);
		}
		
		return true;
	}
}

