<?php
/**
 * Hooks for MathspediaMath extension
 * Provides enhanced math features: LaTeX, interactive code, custom formatting
 */

class MathspediaMathHooks {
	
	/**
	 * Hook: ParserFirstCallInit
	 * Register custom parser tags
	 */
	public static function onParserFirstCallInit(Parser $parser) {
		// Register [color:...] tag
		$parser->setHook('color', [self::class, 'renderColor']);
		
		// Register [size:...] tag
		$parser->setHook('size', [self::class, 'renderSize']);
		
		// Register [manim] tag for Manim code
		$parser->setHook('manim', [self::class, 'renderManim']);
		
		// Register [interactive] tag for interactive code blocks
		$parser->setHook('interactive', [self::class, 'renderInteractive']);
		
		// Register [embed] tag for external services
		$parser->setHook('embed', [self::class, 'renderEmbed']);
		
		return true;
	}
	
	/**
	 * Render color tag: [color:red]text[/color]
	 */
	public static function renderColor($input, array $args, Parser $parser, PPFrame $frame) {
		$color = $args['value'] ?? 'black';
		return '<span style="color: ' . htmlspecialchars($color) . ';">' . $parser->recursiveTagParse($input, $frame) . '</span>';
	}
	
	/**
	 * Render size tag: [size:large]text[/size]
	 */
	public static function renderSize($input, array $args, Parser $parser, PPFrame $frame) {
		$size = $args['value'] ?? 'medium';
		$sizes = [
			'small' => '0.8em',
			'medium' => '1em',
			'large' => '1.5em',
			'xlarge' => '2em'
		];
		$fontSize = $sizes[$size] ?? '1em';
		return '<span style="font-size: ' . $fontSize . ';">' . $parser->recursiveTagParse($input, $frame) . '</span>';
	}
	
	/**
	 * Render Manim code block
	 */
	public static function renderManim($input, array $args, Parser $parser, PPFrame $frame) {
		$code = htmlspecialchars($input);
		$id = 'manim-' . uniqid();
		
		return '<div class="manim-code-block" id="' . $id . '">' .
			'<div class="manim-code-header">Manim Code <button onclick="copyManimCode(\'' . $id . '\')">Copy</button></div>' .
			'<pre class="manim-code-content"><code>' . $code . '</code></pre>' .
			'<div class="manim-note">Note: This is Manim Python code for creating mathematical animations.</div>' .
			'</div>';
	}
	
	/**
	 * Render interactive code block
	 */
	public static function renderInteractive($input, array $args, Parser $parser, PPFrame $frame) {
		$code = htmlspecialchars($input);
		$id = 'interactive-' . uniqid();
		
		// Generate sandboxed iframe HTML
		$html = self::generateInteractiveHTML($code, $id);
		
		return '<div class="interactive-block" id="' . $id . '">' .
			'<div class="interactive-header">' .
			'<button onclick="showInteractiveCode(\'' . $id . '\')">Show Code</button>' .
			'<button onclick="reloadInteractive(\'' . $id . '\')">Reload</button>' .
			'</div>' .
			'<div class="interactive-code" style="display:none;"><pre><code>' . $code . '</code></pre></div>' .
			'<div class="interactive-iframe-container">' . $html . '</div>' .
			'</div>';
	}
	
	/**
	 * Render embed tag for external services
	 */
	public static function renderEmbed($input, array $args, Parser $parser, PPFrame $frame) {
		$url = trim($input);
		if (!preg_match('/^https?:\/\//', $url)) {
			return '<span class="error">Invalid URL: Only HTTP/HTTPS URLs are allowed</span>';
		}
		
		$width = $args['width'] ?? '100%';
		$height = $args['height'] ?? '600px';
		
		return '<div class="embed-container">' .
			'<iframe src="' . htmlspecialchars($url) . '" width="' . htmlspecialchars($width) . '" height="' . htmlspecialchars($height) . '" frameborder="0"></iframe>' .
			'</div>';
	}
	
	/**
	 * Generate HTML for sandboxed interactive iframe
	 */
	private static function generateInteractiveHTML($code, $id) {
		// Create a sandboxed iframe with controlled MathAPI
		$html = '<!DOCTYPE html><html><head><title>Interactive Math</title></head><body>';
		$html .= '<script>' . self::getMathAPI() . '</script>';
		$html .= '<script>' . $code . '</script>';
		$html .= '</body></html>';
		
		$dataUri = 'data:text/html;base64,' . base64_encode($html);
		return '<iframe src="' . $dataUri . '" sandbox="allow-scripts" style="width:100%;height:400px;border:1px solid #ccc;"></iframe>';
	}
	
	/**
	 * Get controlled MathAPI for sandboxed execution
	 */
	private static function getMathAPI() {
		return <<<'JS'
window.MathAPI = {
	plot: function(data) { /* Safe plotting */ },
	calculate: function(expr) { /* Safe calculation */ },
	// Add more safe math functions
};
JS;
	}
	
	/**
	 * Hook: BeforePageDisplay
	 * Add resources
	 */
	public static function onBeforePageDisplay($out, $skin) {
		$out->addModules('ext.mathspediaMath');
		return true;
	}
}

