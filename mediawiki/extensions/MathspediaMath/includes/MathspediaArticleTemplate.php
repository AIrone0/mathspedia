<?php
/**
 * Article template for Mathspedia
 * Provides default structure for new articles
 */

class MathspediaArticleTemplate {
	
	/**
	 * Get the default template for new articles
	 * @param Title $title The page title
	 * @return string Template wikitext
	 */
	public static function getTemplate($title) {
		$pageName = $title->getText();
		
		$template = <<<WIKI
== $pageName ==

== Introduction ==

== Theorem dependencies graph (ordered along a time-line of the date proven) ==

== History ==

== Proof ==

== Implications ==

== Requisites ==
* 

== References ==
<references />

== External links ==
* 

WIKI;
		
		return $template;
	}
}

