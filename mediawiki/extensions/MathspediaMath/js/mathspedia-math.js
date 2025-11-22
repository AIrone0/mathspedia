/**
 * Mathspedia Math JavaScript
 * Provides client-side functionality for interactive features
 */

function copyManimCode(id) {
	const codeBlock = document.querySelector('[data-code-id="' + id + '"]');
	if (!codeBlock) return;
	
	const code = codeBlock.querySelector('.manim-code-content code').textContent;
	
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(code).then(() => {
			alert('Manim code copied to clipboard!');
		}).catch(() => {
			// Fallback
			copyToClipboardFallback(code);
		});
	} else {
		copyToClipboardFallback(code);
	}
}

function copyToClipboardFallback(text) {
	const textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.style.position = 'fixed';
	textarea.style.opacity = '0';
	document.body.appendChild(textarea);
	textarea.select();
	try {
		document.execCommand('copy');
		alert('Manim code copied to clipboard!');
	} catch (err) {
		alert('Failed to copy code. Please select and copy manually.');
	}
	document.body.removeChild(textarea);
}

function showInteractiveCode(id) {
	const codeDiv = document.getElementById('code-' + id);
	if (codeDiv) {
		codeDiv.classList.toggle('hidden');
	}
}

function reloadInteractive(id) {
	const iframe = document.getElementById('iframe-' + id);
	if (!iframe) return;
	
	const block = document.querySelector('[data-interactive-id="' + id + '"]');
	if (!block) return;
	
	const codeDiv = document.getElementById('code-' + id);
	if (codeDiv) {
		const codeElement = codeDiv.querySelector('code');
		if (codeElement) {
			const code = codeElement.textContent;
			// Regenerate iframe HTML (would need to call PHP function, but for now just reload)
			iframe.src = iframe.src; // Simple reload
		}
	}
}

// Make functions globally available
window.copyManimCode = copyManimCode;
window.showInteractiveCode = showInteractiveCode;
window.reloadInteractive = reloadInteractive;

