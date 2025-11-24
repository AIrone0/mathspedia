/**
 * Proof dependency visualization with Mermaid.js
 */

(function() {
	'use strict';
	
	// Load Mermaid from CDN
	function loadMermaid(callback) {
		if (typeof mermaid !== 'undefined') {
			callback();
			return;
		}
		
		var script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
		script.onload = function() {
			mermaid.initialize({
				startOnLoad: false,
				theme: 'default',
				securityLevel: 'loose'
			});
			callback();
		};
		script.onerror = function() {
			console.error('Failed to load Mermaid.js');
		};
		document.head.appendChild(script);
	}
	
	// Render the graph
	function renderGraph() {
		if (!window.proofData || !window.proofData.mermaid) {
			return;
		}
		
		var container = document.getElementById('proof-graph');
		if (!container) {
			return;
		}
		
		var data = window.proofData;
		
		if (data.nodeCount === 0) {
			container.innerHTML = '<div class="error">No dependencies found for "' + data.proof + '"</div>';
			return;
		}
		
		container.innerHTML = '<div class="info">Proof: ' + data.proof + ' | Nodes: ' + data.nodeCount + ' | Edges: ' + data.edgeCount + '</div>' +
			'<div class="mermaid">' + escapeHtml(data.mermaid) + '</div>';
		
		loadMermaid(function() {
			mermaid.run({nodes: [container.querySelector('.mermaid')]});
		});
	}
	
	function escapeHtml(text) {
		var div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}
	
	// Setup autocomplete
	function setupAutocomplete() {
		var input = document.getElementById('proof-input');
		if (!input) {
			return;
		}
		
		var list = document.createElement('ul');
		list.className = 'autocomplete';
		input.parentNode.appendChild(list);
		
		var timeout;
		
		input.addEventListener('input', function() {
			clearTimeout(timeout);
			var query = input.value.trim();
			
			if (query.length < 2) {
				list.style.display = 'none';
				return;
			}
			
			timeout = setTimeout(function() {
				var api = new mw.Api();
				api.get({
					action: 'opensearch',
					search: query,
					limit: 10,
					namespace: 0
				}).done(function(data) {
					if (data && data[1] && data[1].length > 0) {
						showSuggestions(data[1]);
					} else {
						list.style.display = 'none';
					}
				});
			}, 300);
		});
		
		function showSuggestions(titles) {
			list.innerHTML = '';
			titles.forEach(function(title) {
				var li = document.createElement('li');
				li.textContent = title;
				li.addEventListener('click', function() {
					input.value = title;
					list.style.display = 'none';
				});
				list.appendChild(li);
			});
			list.style.display = 'block';
		}
		
		document.addEventListener('click', function(e) {
			if (e.target !== input && !list.contains(e.target)) {
				list.style.display = 'none';
			}
		});
	}
	
	// Initialize
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function() {
			renderGraph();
			setTimeout(setupAutocomplete, 100);
		});
	} else {
		renderGraph();
		setTimeout(setupAutocomplete, 100);
	}
})();
