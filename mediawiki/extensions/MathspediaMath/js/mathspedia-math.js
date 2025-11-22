/**
 * Mathspedia Math JavaScript
 * Provides client-side functionality for interactive features
 */

function copyManimCode(id) {
	const codeBlock = document.getElementById(id);
	const code = codeBlock.querySelector('.manim-code-content code').textContent;
	navigator.clipboard.writeText(code).then(() => {
		alert('Code copied to clipboard!');
	});
}

function showInteractiveCode(id) {
	const block = document.getElementById(id);
	const codeDiv = block.querySelector('.interactive-code');
	codeDiv.style.display = codeDiv.style.display === 'none' ? 'block' : 'none';
}

function reloadInteractive(id) {
	const block = document.getElementById(id);
	const iframe = block.querySelector('iframe');
	if (iframe) {
		iframe.src = iframe.src; // Reload iframe
	}
}

