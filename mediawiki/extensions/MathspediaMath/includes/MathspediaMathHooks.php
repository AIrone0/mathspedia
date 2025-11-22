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
		// Register <color> tag: <color value="red">text</color>
		$parser->setHook('color', [self::class, 'renderColor']);
		
		// Register <size> tag: <size value="large">text</size>
		$parser->setHook('size', [self::class, 'renderSize']);
		
		// Register <manim> tag for Manim code: <manim>code</manim>
		$parser->setHook('manim', [self::class, 'renderManim']);
		
		// Register <interactive> tag for interactive code blocks: <interactive>code</interactive>
		$parser->setHook('interactive', [self::class, 'renderInteractive']);
		
		// Register <embed> tag for external services: <embed url="..." width="..." height="..."/>
		$parser->setHook('embed', [self::class, 'renderEmbed']);
		
		return true;
	}
	
	/**
	 * Render color tag: <color value="red">text</color>
	 */
	public static function renderColor($input, array $args, Parser $parser, PPFrame $frame) {
		$color = $args['value'] ?? 'black';
		return '<span style="color: ' . htmlspecialchars($color) . ';">' . $parser->recursiveTagParse($input, $frame) . '</span>';
	}
	
	/**
	 * Render size tag: <size value="large">text</size>
	 */
	public static function renderSize($input, array $args, Parser $parser, PPFrame $frame) {
		$size = $args['value'] ?? 'medium';
		$sizes = [
			'small' => '0.8em',
			'medium' => '1em',
			'large' => '1.5em',
			'xlarge' => '2em',
			'xxlarge' => '3em'
		];
		$fontSize = $sizes[$size] ?? $size; // Allow custom sizes like "2em"
		return '<span style="font-size: ' . htmlspecialchars($fontSize) . ';">' . $parser->recursiveTagParse($input, $frame) . '</span>';
	}
	
	/**
	 * Render Manim code block: <manim>code</manim>
	 */
	public static function renderManim($input, array $args, Parser $parser, PPFrame $frame) {
		$code = htmlspecialchars(trim($input));
		$id = 'manim-' . uniqid();
		
		return '<div class="manim-code-block" data-code-id="' . $id . '">' .
			'<div class="manim-code-header">' .
			'<strong>Manim Code</strong> ' .
			'<button class="btn-small" onclick="copyManimCode(\'' . $id . '\')">Copy Code</button>' .
			'</div>' .
			'<pre class="manim-code-content"><code class="language-python">' . $code . '</code></pre>' .
			'<div class="manim-note">' .
			'<em>Note: This Manim code needs to be rendered using Manim. Copy the code and run it with: <code>manim -pql script.py SceneName</code></em>' .
			'</div>' .
			'</div>';
	}
	
	/**
	 * Render interactive code block: <interactive>code</interactive>
	 */
	public static function renderInteractive($input, array $args, Parser $parser, PPFrame $frame) {
		$code = trim($input);
		$id = 'interactive-' . uniqid();
		$escapedCode = htmlspecialchars($code);
		
		// Generate sandboxed iframe HTML
		$html = self::generateInteractiveHTML($code, $id);
		$escapedHtml = htmlspecialchars($html);
		
		return '<div class="interactive-block" data-interactive-id="' . $id . '">' .
			'<div class="interactive-header">' .
			'<strong>Interactive Animation</strong> ' .
			'<button class="btn-small" onclick="reloadInteractive(\'' . $id . '\')">Reload</button> ' .
			'<button class="btn-small" onclick="showInteractiveCode(\'' . $id . '\')">View Code</button>' .
			'</div>' .
			'<iframe id="iframe-' . $id . '" class="interactive-iframe" sandbox="allow-scripts allow-same-origin" srcdoc="' . $escapedHtml . '"></iframe>' .
			'<div id="code-' . $id . '" class="interactive-code hidden">' .
			'<pre><code class="language-javascript">' . $escapedCode . '</code></pre>' .
			'</div>' .
			'</div>';
	}
	
	/**
	 * Render embed tag for external services: <embed url="..." width="..." height="..."/>
	 */
	public static function renderEmbed($input, array $args, Parser $parser, PPFrame $frame) {
		$url = trim($input ?: ($args['url'] ?? ''));
		if (!$url) {
			return '<span class="error">Embed tag requires a URL</span>';
		}
		
		// Validate URL
		if (!preg_match('/^https:\/\//', $url)) {
			return '<span class="error">Invalid URL: Only HTTPS URLs are allowed</span>';
		}
		
		$width = $args['width'] ?? '100%';
		$height = $args['height'] ?? '600px';
		
		return '<div class="embed-container">' .
			'<iframe src="' . htmlspecialchars($url) . '" width="' . htmlspecialchars($width) . '" height="' . htmlspecialchars($height) . '" ' .
			'frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>' .
			'</div>';
	}
	
	/**
	 * Generate HTML for sandboxed interactive iframe
	 */
	private static function generateInteractiveHTML($code, $id) {
		$escapedCode = str_replace(['</script>', '<script'], ['<\/script>', '<script'], $code);
		
		$html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 10px; font-family: Arial, sans-serif; background: #fff; }
        canvas { border: 1px solid #ccc; display: block; margin: 10px auto; }
    </style>
</head>
<body>
    <div id="container"></div>
    <script>
        const MathAPI = {
            createCanvas: function(width, height) {
                const canvas = document.createElement('canvas');
                canvas.width = width || 400;
                canvas.height = height || 400;
                document.getElementById('container').appendChild(canvas);
                return canvas.getContext('2d');
            },
            Math: Math,
            requestAnimationFrame: window.requestAnimationFrame.bind(window),
            cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
            addEventListener: function(element, event, handler) {
                if (element && typeof handler === 'function') {
                    element.addEventListener(event, handler);
                }
            },
            createElement: function(tag) { return document.createElement(tag); },
            getElementById: function(id) { return document.getElementById(id); },
            querySelector: function(selector) { return document.querySelector(selector); },
            log: function(...args) { console.log(...args); },
            setTimeout: function(fn, delay) { return setTimeout(fn, delay); },
            setInterval: function(fn, delay) { return setInterval(fn, delay); },
            clearTimeout: function(id) { clearTimeout(id); },
            clearInterval: function(id) { clearInterval(id); }
        };
        window.MathAPI = MathAPI;
        try {
            (function() { {$escapedCode} })();
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'color: red; padding: 10px; border: 1px solid red;';
            errorDiv.textContent = 'Error: ' + error.message;
            document.getElementById('container').appendChild(errorDiv);
            console.error('Interactive code error:', error);
        }
    </script>
</body>
</html>
HTML;
		
		return $html;
	}
	
	/**
	 * Hook: BeforePageDisplay
	 * Add resources and show source alerts
	 */
	public static function onBeforePageDisplay($out, $skin) {
		$out->addModules('ext.mathspediaMath');
		
		// Check for reported sources
		$title = $out->getTitle();
		if ($title && $title->exists()) {
			require_once __DIR__ . '/MathspediaSourceReporting.php';
			$reportedSources = MathspediaSourceReporting::getReportedSourcesForPage($title);
			
			if (!empty($reportedSources)) {
				$alert = '<div class="mathspedia-source-alert" style="background: #fff3cd; border: 1px solid #ffc107; padding: 1em; margin: 1em 0; border-radius: 4px;">' .
					'<strong>⚠️ Warning:</strong> This article contains references to sources that have been reported as outdated or false.';
				foreach ($reportedSources as $source) {
					$reason = MathspediaSourceReporting::isSourceReported($source);
					$alert .= '<br/>• ' . htmlspecialchars($source) . ' (' . htmlspecialchars($reason) . ')';
				}
				$alert .= '</div>';
				$out->prependHTML($alert);
			}
		}
		
		return true;
	}
}

