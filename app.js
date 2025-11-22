// Authority rank hierarchy (higher number = higher authority)
const RANK_HIERARCHY = {
    'math_enjoyer': 1,
    'undergraduate': 2,
    'graduate': 3,
    'math_teacher': 4,
    'phd': 5,
    'professor': 6
};

// Initialize application
let currentUser = null;
let currentArticle = null;
let isEditMode = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadHomePage();
});

function initializeApp() {
    // Initialize localStorage if needed
    if (!localStorage.getItem('articles')) {
        localStorage.setItem('articles', JSON.stringify({}));
    }
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify({}));
    }
    if (!localStorage.getItem('abTests')) {
        localStorage.setItem('abTests', JSON.stringify({}));
    }
    if (!localStorage.getItem('reportedSources')) {
        localStorage.setItem('reportedSources', JSON.stringify({}));
    }
    if (!localStorage.getItem('articleHistory')) {
        localStorage.setItem('articleHistory', JSON.stringify({}));
    }
    if (!localStorage.getItem('media')) {
        localStorage.setItem('media', JSON.stringify({}));
    }

    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForUser();
    }
}

function setupEventListeners() {
    // Login/Logout
    document.getElementById('login-btn').addEventListener('click', () => {
        document.getElementById('login-modal').classList.remove('hidden');
    });
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Register
    document.getElementById('register-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('register-modal').classList.remove('hidden');
    });
    document.getElementById('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-modal').classList.add('hidden');
        document.getElementById('login-modal').classList.remove('hidden');
    });

    // Forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('report-form').addEventListener('submit', handleReportSource);
    document.getElementById('media-form').addEventListener('submit', handleMediaUpload);
    
    // Media file preview
    const mediaFileInput = document.getElementById('media-file');
    const mediaTypeSelect = document.getElementById('media-type');
    
    function updateMediaPreview() {
        const file = mediaFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('media-preview');
                preview.classList.remove('hidden');
                const mediaType = mediaTypeSelect.value;
                if (mediaType === 'image') {
                    preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; height: auto;" alt="Preview" />`;
                } else {
                    preview.innerHTML = `<video controls style="max-width: 100%;"><source src="${e.target.result}" type="${file.type}" /></video>`;
                }
            };
            reader.readAsDataURL(file);
        }
    }
    
    mediaFileInput.addEventListener('change', updateMediaPreview);
    mediaTypeSelect.addEventListener('change', updateMediaPreview);

    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.add('hidden');
        });
    });

    // Search
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Article actions
    document.getElementById('edit-btn').addEventListener('click', enterEditMode);
    document.getElementById('save-btn').addEventListener('click', saveArticle);
    document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);

    // Random article
    document.getElementById('random-article').addEventListener('click', loadRandomArticle);

    // Create article
    document.getElementById('create-article-btn').addEventListener('click', createNewArticle);

    // Home link
    document.querySelector('header h1 a').addEventListener('click', (e) => {
        e.preventDefault();
        loadHomePage();
    });
}

// User Authentication
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rank = document.getElementById('user-rank').value;

    const users = JSON.parse(localStorage.getItem('users'));
    
    if (users[username] && users[username].password === password) {
        currentUser = {
            username: username,
            rank: users[username].rank
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIForUser();
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('login-form').reset();
    } else {
        alert('Invalid username or password');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const rank = document.getElementById('reg-rank').value;

    const users = JSON.parse(localStorage.getItem('users'));
    
    if (users[username]) {
        alert('Username already exists');
        return;
    }

    users[username] = {
        password: password,
        rank: rank
    };
    localStorage.setItem('users', JSON.stringify(users));

    currentUser = { username, rank };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUIForUser();
    document.getElementById('register-modal').classList.add('hidden');
    document.getElementById('register-form').reset();
    alert('Registration successful!');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForUser();
    loadHomePage();
}

function updateUIForUser() {
    if (currentUser) {
        document.getElementById('user-info').textContent = `${currentUser.username} (${formatRank(currentUser.rank)})`;
        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('login-btn').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        document.getElementById('create-article-btn').classList.remove('hidden');
    } else {
        document.getElementById('user-info').classList.add('hidden');
        document.getElementById('login-btn').classList.remove('hidden');
        document.getElementById('logout-btn').classList.add('hidden');
        document.getElementById('create-article-btn').classList.add('hidden');
    }
}

function formatRank(rank) {
    return rank.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Create new article
function createNewArticle() {
    if (!currentUser) {
        alert('Please log in to create articles');
        return;
    }
    
    const articleTitle = prompt('Enter the title of the new article:');
    if (articleTitle && articleTitle.trim()) {
        loadArticle(articleTitle.trim());
    }
}

// Article Management
function loadArticle(title) {
    const articles = JSON.parse(localStorage.getItem('articles'));
    currentArticle = articles[title] || null;

    if (!currentArticle) {
        // Create new article
        currentArticle = {
            title: title,
            content: {
                introduction: '',
                mainContent: '',
                history: '',
                applications: '',
                relatedConcepts: '',
                seeAlso: []
            },
            references: [],
            furtherReading: [],
            externalLinks: [],
            author: currentUser ? currentUser.username : null,
            authorRank: currentUser ? currentUser.rank : null,
            lastModified: new Date().toISOString(),
            isTheorem: false
        };
    }

    displayArticle();
    document.getElementById('home-page').classList.add('hidden');
    document.getElementById('article-container').classList.remove('hidden');
}

function displayArticle() {
    if (!currentArticle) return;

    document.getElementById('article-title').textContent = currentArticle.title;
    
    const contentDiv = document.getElementById('article-content');
    contentDiv.innerHTML = '';

    // Check for source alerts
    const reportedSources = JSON.parse(localStorage.getItem('reportedSources'));
    const hasSourceAlerts = currentArticle.references.some(ref => 
        reportedSources[ref] && reportedSources[ref].reported
    );

    if (hasSourceAlerts) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'source-alert';
        alertDiv.innerHTML = '<strong>⚠️ Warning:</strong> This article contains references to sources that have been reported as outdated or false.';
        contentDiv.appendChild(alertDiv);
    }

    // Introduction
    if (currentArticle.content.introduction) {
        const introDiv = document.createElement('div');
        introDiv.innerHTML = `<p>${processLinks(currentArticle.content.introduction)}</p>`;
        contentDiv.appendChild(introDiv);
    }

    // History (for theorems)
    if (currentArticle.isTheorem && currentArticle.content.history) {
        const historyDiv = document.createElement('div');
        historyDiv.innerHTML = `<h2>History</h2><p>${processLinks(currentArticle.content.history)}</p>`;
        contentDiv.appendChild(historyDiv);
    }

    // Main content
    if (currentArticle.content.mainContent) {
        const mainDiv = document.createElement('div');
        mainDiv.innerHTML = `<h2>Main Content</h2>${processLinks(currentArticle.content.mainContent)}`;
        contentDiv.appendChild(mainDiv);
    }

    // Applications (for theorems)
    if (currentArticle.isTheorem && currentArticle.content.applications) {
        const appsDiv = document.createElement('div');
        appsDiv.innerHTML = `<h2>Applications</h2><p>${processLinks(currentArticle.content.applications)}</p>`;
        contentDiv.appendChild(appsDiv);
    }

    // Related Concepts
    if (currentArticle.content.relatedConcepts) {
        const relatedDiv = document.createElement('div');
        relatedDiv.innerHTML = `<h2>Related Concepts</h2><p>${processLinks(currentArticle.content.relatedConcepts)}</p>`;
        contentDiv.appendChild(relatedDiv);
    }

    // See Also
    if (currentArticle.content.seeAlso && currentArticle.content.seeAlso.length > 0) {
        const seeAlsoDiv = document.createElement('div');
        const seeAlsoList = currentArticle.content.seeAlso.map(link => 
            `<li><a href="#" data-article="${link}">${link}</a></li>`
        ).join('');
        seeAlsoDiv.innerHTML = `<h2>See Also</h2><ul>${seeAlsoList}</ul>`;
        contentDiv.appendChild(seeAlsoDiv);
    }

    // References
    if (currentArticle.references && currentArticle.references.length > 0) {
        const refDiv = document.createElement('div');
        const refList = currentArticle.references.map((ref, idx) => {
            const isReported = reportedSources[ref] && reportedSources[ref].reported;
            const alertClass = isReported ? 'source-alert' : '';
            return `<li class="${alertClass}">${idx + 1}. ${ref} ${isReported ? '<strong>(⚠️ Reported)</strong>' : ''} <button class="btn" onclick="reportSource('${ref}')" style="font-size: 0.8em; padding: 0.2em 0.5em;">Report</button></li>`;
        }).join('');
        refDiv.innerHTML = `<h2>References</h2><ol>${refList}</ol>`;
        contentDiv.appendChild(refDiv);
    }

    // Further Reading
    if (currentArticle.furtherReading && currentArticle.furtherReading.length > 0) {
        const frDiv = document.createElement('div');
        const frList = currentArticle.furtherReading.map(item => 
            `<li>${item}</li>`
        ).join('');
        frDiv.innerHTML = `<h2>Further Reading</h2><ul>${frList}</ul>`;
        contentDiv.appendChild(frDiv);
    }

    // External Links
    if (currentArticle.externalLinks && currentArticle.externalLinks.length > 0) {
        const extDiv = document.createElement('div');
        const extList = currentArticle.externalLinks.map(link => 
            `<li><a href="${link}" target="_blank">${link}</a></li>`
        ).join('');
        extDiv.innerHTML = `<h2>External Links</h2><ul>${extList}</ul>`;
        contentDiv.appendChild(extDiv);
    }

    // Check for A/B tests
    checkForABTests();

    // Setup link handlers
    contentDiv.querySelectorAll('a[data-article]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadArticle(e.target.getAttribute('data-article'));
        });
    });

    // Render LaTeX math
    setTimeout(() => {
        renderMath(contentDiv);
    }, 100);

    // Show edit button if user has permission
    updateEditButtonVisibility();
}

function processLinks(text) {
    if (!text) return '';
    
    let processed = text;
    
    // Process colors: [color:red]text[/color] or [color:#ff0000]text[/color]
    processed = processed.replace(/\[color:([^\]]+)\]([^\[]*)\[\/color\]/g, (match, color, content) => {
        return `<span style="color: ${color}">${content}</span>`;
    });
    
    // Process sizes: [size:large]text[/size] or [size:2em]text[/size]
    processed = processed.replace(/\[size:([^\]]+)\]([^\[]*)\[\/size\]/g, (match, size, content) => {
        // Support named sizes
        const sizeMap = {
            'small': '0.8em',
            'normal': '1em',
            'large': '1.5em',
            'xlarge': '2em',
            'xxlarge': '3em'
        };
        const finalSize = sizeMap[size.toLowerCase()] || size;
        return `<span style="font-size: ${finalSize}">${content}</span>`;
    });
    
    // Keep LaTeX delimiters for KaTeX to process
    // Don't escape $ delimiters - KaTeX will handle them
    
    // Process Manim code blocks: [manim:code]...[/manim]
    processed = processed.replace(/\[manim:code\]([\s\S]*?)\[\/manim\]/g, (match, code) => {
        const codeId = 'manim-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        return `<div class="manim-code-block" data-code-id="${codeId}">
            <div class="manim-header">
                <strong>Manim Code</strong>
                <button class="btn-small" onclick="copyManimCode('${codeId}')">Copy Code</button>
            </div>
            <pre><code class="language-python">${escapeHtml(code.trim())}</code></pre>
            <div class="manim-note">
                <em>Note: This Manim code needs to be rendered using Manim. Copy the code and run it with: <code>manim -pql script.py SceneName</code></em>
            </div>
        </div>`;
    });
    
    // Process interactive code blocks: [interactive:code]...[/interactive]
    processed = processed.replace(/\[interactive:code\]([\s\S]*?)\[\/interactive\]/g, (match, code) => {
        const interactiveId = 'interactive-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const trimmedCode = code.trim();
        const htmlContent = generateInteractiveHTML(trimmedCode, interactiveId);
        // Escape HTML for srcdoc attribute
        const escapedHtml = htmlContent
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        return `<div class="interactive-block" data-interactive-id="${interactiveId}">
            <div class="interactive-header">
                <strong>Interactive Animation</strong>
                <button class="btn-small" onclick="reloadInteractive('${interactiveId}')">Reload</button>
                <button class="btn-small" onclick="showInteractiveCode('${interactiveId}')">View Code</button>
            </div>
            <iframe 
                id="iframe-${interactiveId}" 
                class="interactive-iframe" 
                sandbox="allow-scripts allow-same-origin"
                srcdoc="${escapedHtml}"
            ></iframe>
            <div id="code-${interactiveId}" class="interactive-code hidden">
                <pre><code class="language-javascript">${escapeHtml(trimmedCode)}</code></pre>
            </div>
        </div>`;
    });
    
    // Process external iframe embeds: [embed:url] or [embed:url|width|height]
    processed = processed.replace(/\[embed:([^\|\]]+)(?:\|([^\|]+))?(?:\|([^\]]+))?\]/g, (match, url, width, height) => {
        const embedId = 'embed-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const embedWidth = width || '100%';
        const embedHeight = height || '600px';
        // Validate URL for security
        try {
            const urlObj = new URL(url);
            // Only allow https URLs from trusted domains (can be customized)
            if (urlObj.protocol === 'https:') {
                return `<div class="embed-block">
                    <iframe 
                        id="embed-${embedId}" 
                        class="embed-iframe" 
                        src="${escapeHtml(url)}"
                        width="${embedWidth}"
                        height="${embedHeight}"
                        frameborder="0"
                        allowfullscreen
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    ></iframe>
                </div>`;
            } else {
                return `<span class="media-error">[Invalid embed URL: Only HTTPS URLs are allowed]</span>`;
            }
        } catch (e) {
            return `<span class="media-error">[Invalid embed URL: ${escapeHtml(url)}]</span>`;
        }
    });
    
    // Process image embeds: [image:mediaId] or [image:mediaId|alt text]
    processed = processed.replace(/\[image:([^\|\]]+)(?:\|([^\]]+))?\]/g, (match, mediaId, altText) => {
        const media = JSON.parse(localStorage.getItem('media'));
        const mediaItem = media[mediaId];
        if (mediaItem && mediaItem.type === 'image') {
            return `<figure class="article-media">
                <img src="${mediaItem.data}" alt="${altText || mediaItem.alt || ''}" />
                ${altText || mediaItem.alt ? `<figcaption>${altText || mediaItem.alt}</figcaption>` : ''}
            </figure>`;
        }
        return `<span class="media-error">[Image not found: ${mediaId}]</span>`;
    });
    
    // Process video embeds: [video:mediaId] or [video:mediaId|caption]
    processed = processed.replace(/\[video:([^\|\]]+)(?:\|([^\]]+))?\]/g, (match, mediaId, caption) => {
        const media = JSON.parse(localStorage.getItem('media'));
        const mediaItem = media[mediaId];
        if (mediaItem && mediaItem.type === 'video') {
            return `<figure class="article-media">
                <video controls>
                    <source src="${mediaItem.data}" type="${mediaItem.mimeType || 'video/mp4'}" />
                    Your browser does not support the video tag.
                </video>
                ${caption || mediaItem.alt ? `<figcaption>${caption || mediaItem.alt}</figcaption>` : ''}
            </figure>`;
        }
        return `<span class="media-error">[Video not found: ${mediaId}]</span>`;
    });
    
    // Convert [[Article Name]] to clickable links
    processed = processed.replace(/\[\[([^\]]+)\]\]/g, (match, articleName) => {
        const articles = JSON.parse(localStorage.getItem('articles'));
        const exists = articles[articleName];
        const className = exists ? '' : 'new';
        return `<a href="#" data-article="${articleName}" class="${className}">${articleName}</a>`;
    });
    
    return processed;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


function generateInteractiveHTML(code, interactiveId) {
    // Generate HTML for sandboxed iframe with controlled API
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 10px;
            font-family: Arial, sans-serif;
            background: #fff;
        }
        canvas {
            border: 1px solid #ccc;
            display: block;
            margin: 10px auto;
        }
    </style>
</head>
<body>
    <div id="container"></div>
    <script>
        // Controlled API - Safe math and graphics functions
        const MathAPI = {
            // Canvas API
            createCanvas: function(width, height) {
                const canvas = document.createElement('canvas');
                canvas.width = width || 400;
                canvas.height = height || 400;
                document.getElementById('container').appendChild(canvas);
                return canvas.getContext('2d');
            },
            
            // Math functions (pre-loaded)
            Math: Math,
            
            // Animation helpers
            requestAnimationFrame: window.requestAnimationFrame.bind(window),
            cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
            
            // Event listeners (limited)
            addEventListener: function(element, event, handler) {
                if (element && typeof handler === 'function') {
                    element.addEventListener(event, handler);
                }
            },
            
            // DOM helpers (limited)
            createElement: function(tag) {
                return document.createElement(tag);
            },
            
            getElementById: function(id) {
                return document.getElementById(id);
            },
            
            querySelector: function(selector) {
                return document.querySelector(selector);
            },
            
            // Console (for debugging)
            log: function(...args) {
                console.log(...args);
            },
            
            // Timer functions
            setTimeout: function(fn, delay) {
                return setTimeout(fn, delay);
            },
            setInterval: function(fn, delay) {
                return setInterval(fn, delay);
            },
            clearTimeout: function(id) {
                clearTimeout(id);
            },
            clearInterval: function(id) {
                clearInterval(id);
            }
        };
        
        // Make API available globally
        window.MathAPI = MathAPI;
        
        // Execute user code
        try {
            (function() {
                ${code.replace(/<\/script>/gi, '<\\/script>')}
            })();
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'red';
            errorDiv.style.padding = '10px';
            errorDiv.style.border = '1px solid red';
            errorDiv.textContent = 'Error: ' + error.message;
            document.getElementById('container').appendChild(errorDiv);
            console.error('Interactive code error:', error);
        }
    </script>
</body>
</html>`;
}

function renderMath(element) {
    // Render LaTeX using KaTeX
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });
    }
}

function updateEditButtonVisibility() {
    const editBtn = document.getElementById('edit-btn');
    const articleActions = document.getElementById('article-actions');
    
    if (!currentUser) {
        articleActions.classList.add('hidden');
        return;
    }

    if (!currentArticle || !currentArticle.authorRank) {
        // New article or no author - can edit
        articleActions.classList.remove('hidden');
        return;
    }

    const userRank = RANK_HIERARCHY[currentUser.rank];
    const authorRank = RANK_HIERARCHY[currentArticle.authorRank];

    if (userRank >= authorRank) {
        articleActions.classList.remove('hidden');
    } else {
        articleActions.classList.add('hidden');
    }
}

function enterEditMode() {
    if (!currentUser) {
        alert('Please log in to edit articles');
        return;
    }

    if (!currentArticle) {
        currentArticle = {
            title: document.getElementById('article-title').textContent,
            content: {
                introduction: '',
                mainContent: '',
                history: '',
                applications: '',
                relatedConcepts: '',
                seeAlso: []
            },
            references: [],
            furtherReading: [],
            externalLinks: [],
            author: currentUser.username,
            authorRank: currentUser.rank,
            lastModified: new Date().toISOString(),
            isTheorem: false
        };
    }

    // Check authority
    if (currentArticle.authorRank && 
        RANK_HIERARCHY[currentUser.rank] < RANK_HIERARCHY[currentArticle.authorRank]) {
        alert('You do not have permission to edit this article. Lower-ranked users cannot edit higher-ranked content.');
        return;
    }

    isEditMode = true;
    const contentDiv = document.getElementById('article-content');
    contentDiv.classList.add('edit-mode');
    
    // Create edit form
    let editHTML = `
        <div class="edit-toolbar">
            <button type="button" class="btn" onclick="openMediaUpload()">Upload Image/Video</button>
            <button type="button" class="btn" onclick="insertManimCode()">Insert Manim Code</button>
            <button type="button" class="btn" onclick="insertInteractiveCode()">Insert Interactive Code</button>
            <button type="button" class="btn" onclick="insertEmbed()">Embed External Service</button>
        </div>
        <p class="formatting-help">
            <strong>Formatting Help:</strong> Use [[Article Name]] for links, $...$ for inline math, $$...$$ for display math, 
            [color:red]text[/color] for colors, [size:large]text[/size] for sizes, 
            [image:mediaId] or [video:mediaId] for media, [manim:code]...[/manim] for Manim animations,
            [interactive:code]...[/interactive] for interactive JavaScript animations, [embed:url|width|height] for external embeds.
        </p>
        <h3>Introduction</h3>
        <textarea id="edit-intro">${currentArticle.content.introduction || ''}</textarea>
        
        <h3>Is this a theorem?</h3>
        <input type="checkbox" id="edit-is-theorem" ${currentArticle.isTheorem ? 'checked' : ''}>
        
        <h3>History (for theorems)</h3>
        <textarea id="edit-history">${currentArticle.content.history || ''}</textarea>
        
        <h3>Main Content</h3>
        <textarea id="edit-main">${currentArticle.content.mainContent || ''}</textarea>
        
        <h3>Applications (for theorems)</h3>
        <textarea id="edit-applications">${currentArticle.content.applications || ''}</textarea>
        
        <h3>Related Concepts</h3>
        <textarea id="edit-related">${currentArticle.content.relatedConcepts || ''}</textarea>
        
        <h3>See Also (one per line)</h3>
        <textarea id="edit-seealso">${(currentArticle.content.seeAlso || []).join('\n')}</textarea>
        
        <h3>References (one per line)</h3>
        <textarea id="edit-references">${(currentArticle.references || []).join('\n')}</textarea>
        
        <h3>Further Reading (one per line)</h3>
        <textarea id="edit-further">${(currentArticle.furtherReading || []).join('\n')}</textarea>
        
        <h3>External Links (one per line)</h3>
        <textarea id="edit-external">${(currentArticle.externalLinks || []).join('\n')}</textarea>
    `;
    
    contentDiv.innerHTML = editHTML;
    
    document.getElementById('edit-btn').classList.add('hidden');
    document.getElementById('save-btn').classList.remove('hidden');
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
}

function saveArticle() {
    if (!currentUser) return;

    // Check for conflicts with same-rank users
    const abTests = JSON.parse(localStorage.getItem('abTests'));
    const articleTitle = currentArticle ? currentArticle.title : document.getElementById('article-title').textContent;
    
    if (currentArticle && currentArticle.author && 
        currentArticle.author !== currentUser.username &&
        currentArticle.authorRank === currentUser.rank) {
        // Same rank conflict - create A/B test
        if (!abTests[articleTitle]) {
            abTests[articleTitle] = [];
        }
        
        const version = {
            author: currentUser.username,
            rank: currentUser.rank,
            content: {
                introduction: document.getElementById('edit-intro').value,
                mainContent: document.getElementById('edit-main').value,
                history: document.getElementById('edit-history').value,
                applications: document.getElementById('edit-applications').value,
                relatedConcepts: document.getElementById('edit-related').value,
                seeAlso: document.getElementById('edit-seealso').value.split('\n').filter(s => s.trim()),
                references: document.getElementById('edit-references').value.split('\n').filter(s => s.trim()),
                furtherReading: document.getElementById('edit-further').value.split('\n').filter(s => s.trim()),
                externalLinks: document.getElementById('edit-external').value.split('\n').filter(s => s.trim())
            },
            isTheorem: document.getElementById('edit-is-theorem').checked,
            timestamp: new Date().toISOString(),
            feedback: []
        };
        
        abTests[articleTitle].push(version);
        localStorage.setItem('abTests', JSON.stringify(abTests));
        alert('Your version has been saved as an alternative version. Users can now compare versions.');
    } else {
        // Normal save
        currentArticle = {
            title: articleTitle,
            content: {
                introduction: document.getElementById('edit-intro').value,
                mainContent: document.getElementById('edit-main').value,
                history: document.getElementById('edit-history').value,
                applications: document.getElementById('edit-applications').value,
                relatedConcepts: document.getElementById('edit-related').value,
                seeAlso: document.getElementById('edit-seealso').value.split('\n').filter(s => s.trim()),
                references: document.getElementById('edit-references').value.split('\n').filter(s => s.trim()),
                furtherReading: document.getElementById('edit-further').value.split('\n').filter(s => s.trim()),
                externalLinks: document.getElementById('edit-external').value.split('\n').filter(s => s.trim())
            },
            references: document.getElementById('edit-references').value.split('\n').filter(s => s.trim()),
            furtherReading: document.getElementById('edit-further').value.split('\n').filter(s => s.trim()),
            externalLinks: document.getElementById('edit-external').value.split('\n').filter(s => s.trim()),
            author: currentUser.username,
            authorRank: currentUser.rank,
            lastModified: new Date().toISOString(),
            isTheorem: document.getElementById('edit-is-theorem').checked
        };

        const articles = JSON.parse(localStorage.getItem('articles'));
        articles[articleTitle] = currentArticle;
        localStorage.setItem('articles', JSON.stringify(articles));

        // Update article history
        const history = JSON.parse(localStorage.getItem('articleHistory'));
        if (!history[articleTitle]) {
            history[articleTitle] = [];
        }
        history[articleTitle].push({
            author: currentUser.username,
            rank: currentUser.rank,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('articleHistory', JSON.stringify(history));
    }

    cancelEdit();
    displayArticle();
}

function cancelEdit() {
    isEditMode = false;
    document.getElementById('article-content').classList.remove('edit-mode');
    document.getElementById('edit-btn').classList.remove('hidden');
    document.getElementById('save-btn').classList.add('hidden');
    document.getElementById('cancel-edit-btn').classList.add('hidden');
    displayArticle();
}

function checkForABTests() {
    if (!currentArticle) return;
    
    const abTests = JSON.parse(localStorage.getItem('abTests'));
    const tests = abTests[currentArticle.title];
    
    if (tests && tests.length > 0) {
        const notice = document.createElement('div');
        notice.className = 'conflict-notice';
        notice.innerHTML = `
            <strong>⚠️ Alternative versions available:</strong> There are ${tests.length} alternative version(s) of this article by users of the same rank. 
            <button class="btn" onclick="showABTests('${currentArticle.title}')">Compare Versions</button>
        `;
        document.getElementById('article-content').insertBefore(notice, document.getElementById('article-content').firstChild);
    }
}

function showABTests(articleTitle) {
    const abTests = JSON.parse(localStorage.getItem('abTests'));
    const tests = abTests[articleTitle];
    const current = JSON.parse(localStorage.getItem('articles'))[articleTitle];
    
    if (!tests || tests.length === 0) return;
    
    const modal = document.getElementById('ab-test-modal');
    const content = document.getElementById('ab-test-content');
    
    let html = '<div class="ab-test-container">';
    
    // Current version
    html += '<div class="ab-version">';
    html += '<h3>Current Version</h3>';
    html += `<p><strong>Author:</strong> ${current.author} (${formatRank(current.authorRank)})</p>`;
    html += `<p><strong>Last Modified:</strong> ${new Date(current.lastModified).toLocaleDateString()}</p>`;
    html += '<div class="ab-feedback">';
    html += '<label>Your Rank:</label>';
    html += '<select id="current-rank">';
    Object.keys(RANK_HIERARCHY).forEach(rank => {
        html += `<option value="${rank}">${formatRank(rank)}</option>`;
    });
    html += '</select>';
    html += '<label>How helpful? (1-5):</label>';
    html += '<select id="current-helpful">';
    for (let i = 1; i <= 5; i++) {
        html += `<option value="${i}">${i}</option>`;
    }
    html += '</select>';
    html += '<button class="btn" onclick="submitABFeedback(\'' + articleTitle + '\', \'current\')">Submit Feedback</button>';
    html += '</div></div>';
    
    // Alternative versions
    tests.forEach((test, idx) => {
        html += '<div class="ab-version">';
        html += `<h3>Alternative Version ${idx + 1}</h3>`;
        html += `<p><strong>Author:</strong> ${test.author} (${formatRank(test.rank)})</p>`;
        html += `<p><strong>Created:</strong> ${new Date(test.timestamp).toLocaleDateString()}</p>`;
        html += '<div class="ab-feedback">';
        html += '<label>Your Rank:</label>';
        html += '<select id="alt-' + idx + '-rank">';
        Object.keys(RANK_HIERARCHY).forEach(rank => {
            html += `<option value="${rank}">${formatRank(rank)}</option>`;
        });
        html += '</select>';
        html += '<label>How helpful? (1-5):</label>';
        html += '<select id="alt-' + idx + '-helpful">';
        for (let i = 1; i <= 5; i++) {
            html += `<option value="${i}">${i}</option>`;
        }
        html += '</select>';
        html += '<button class="btn" onclick="submitABFeedback(\'' + articleTitle + '\', ' + idx + ')">Submit Feedback</button>';
        html += '</div></div>';
    });
    
    html += '</div>';
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

function submitABFeedback(articleTitle, versionIndex) {
    if (!currentUser) {
        alert('Please log in to provide feedback');
        return;
    }
    
    const abTests = JSON.parse(localStorage.getItem('abTests'));
    const tests = abTests[articleTitle];
    
    let rankSelect, helpfulSelect;
    if (versionIndex === 'current') {
        rankSelect = document.getElementById('current-rank');
        helpfulSelect = document.getElementById('current-helpful');
    } else {
        rankSelect = document.getElementById('alt-' + versionIndex + '-rank');
        helpfulSelect = document.getElementById('alt-' + versionIndex + '-helpful');
    }
    
    const feedback = {
        user: currentUser.username,
        userRank: rankSelect.value,
        helpfulness: parseInt(helpfulSelect.value),
        timestamp: new Date().toISOString()
    };
    
    if (versionIndex === 'current') {
        // Store current version feedback separately
        if (!abTests[articleTitle + '_current']) {
            abTests[articleTitle + '_current'] = [];
        }
        abTests[articleTitle + '_current'].push(feedback);
    } else {
        tests[versionIndex].feedback.push(feedback);
    }
    
    localStorage.setItem('abTests', JSON.stringify(abTests));
    alert('Thank you for your feedback!');
}

// Source Reporting
function reportSource(source) {
    if (!currentUser) {
        alert('Please log in to report sources');
        return;
    }
    
    document.getElementById('report-source').value = source;
    document.getElementById('report-modal').classList.remove('hidden');
}

function handleReportSource(e) {
    e.preventDefault();
    const source = document.getElementById('report-source').value;
    const reason = document.getElementById('report-reason').value;
    
    const reportedSources = JSON.parse(localStorage.getItem('reportedSources'));
    reportedSources[source] = {
        reported: true,
        reportedBy: currentUser.username,
        reason: reason,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('reportedSources', JSON.stringify(reportedSources));
    
    document.getElementById('report-modal').classList.add('hidden');
    document.getElementById('report-form').reset();
    alert('Source reported. Alerts will appear on all articles referencing this source.');
    
    // Refresh current article if displayed
    if (currentArticle) {
        displayArticle();
    }
}

// Search
function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const articles = JSON.parse(localStorage.getItem('articles'));
    const results = Object.keys(articles).filter(title => 
        title.toLowerCase().includes(query)
    );
    
    const resultsDiv = document.getElementById('search-results');
    if (results.length === 0 && query.trim()) {
        // Show option to create new article
        const displayQuery = document.getElementById('search-input').value;
        resultsDiv.innerHTML = `<p>No articles found.</p>
            ${currentUser ? `<button class="btn" onclick="createArticleFromSearch('${escapeHtml(displayQuery)}')">Create article: "${escapeHtml(displayQuery)}"</button>` : '<p><em>Log in to create new articles</em></p>'}`;
    } else if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No articles found. Enter a search term to create a new article.</p>';
    } else {
        const list = results.map(title => 
            `<li><a href="#" data-article="${title}">${title}</a></li>`
        ).join('');
        resultsDiv.innerHTML = `<ul>${list}</ul>`;
        
        resultsDiv.querySelectorAll('a[data-article]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadArticle(e.target.getAttribute('data-article'));
            });
        });
    }
    resultsDiv.classList.remove('hidden');
}

function createArticleFromSearch(query) {
    if (!currentUser) {
        alert('Please log in to create articles');
        return;
    }
    if (query && query.trim()) {
        loadArticle(query.trim());
    }
}

// Home Page
function loadHomePage() {
    document.getElementById('home-page').classList.remove('hidden');
    document.getElementById('article-container').classList.add('hidden');
    
    const articles = JSON.parse(localStorage.getItem('articles'));
    const articleTitles = Object.keys(articles);
    
    // Featured articles (first 5)
    const featuredList = document.getElementById('featured-list');
    if (articleTitles.length > 0) {
        featuredList.innerHTML = articleTitles.slice(0, 5).map(title => 
            `<li><a href="#" data-article="${title}">${title}</a></li>`
        ).join('');
        
        featuredList.querySelectorAll('a[data-article]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadArticle(e.target.getAttribute('data-article'));
            });
        });
    } else {
        featuredList.innerHTML = '<li>No articles yet. Create one by searching for a topic!</li>';
    }
    
    // Recent articles (last 5)
    const recentList = document.getElementById('recent-list');
    if (articleTitles.length > 0) {
        const sorted = articleTitles.sort((a, b) => {
            const dateA = new Date(articles[a].lastModified);
            const dateB = new Date(articles[b].lastModified);
            return dateB - dateA;
        });
        
        recentList.innerHTML = sorted.slice(0, 5).map(title => 
            `<li><a href="#" data-article="${title}">${title}</a></li>`
        ).join('');
        
        recentList.querySelectorAll('a[data-article]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadArticle(e.target.getAttribute('data-article'));
            });
        });
    } else {
        recentList.innerHTML = '<li>No articles yet.</li>';
    }
}

function loadRandomArticle() {
    const articles = JSON.parse(localStorage.getItem('articles'));
    const titles = Object.keys(articles);
    if (titles.length === 0) {
        alert('No articles available');
        return;
    }
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    loadArticle(randomTitle);
}

// Media Upload Functions
function openMediaUpload() {
    document.getElementById('media-modal').classList.remove('hidden');
    document.getElementById('media-form').reset();
    document.getElementById('media-preview').classList.add('hidden');
    document.getElementById('media-preview').innerHTML = '';
}

function handleMediaUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('media-file');
    const file = fileInput.files[0];
    const mediaType = document.getElementById('media-type').value;
    const altText = document.getElementById('media-alt').value;
    
    if (!file) {
        alert('Please select a file');
        return;
    }
    
    // Validate file type
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    if (mediaType === 'video' && !file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
    }
    
    // Check file size (limit to 5MB for localStorage)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB. For larger files, consider using external hosting.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const mediaId = 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const mediaData = {
            id: mediaId,
            type: mediaType,
            data: e.target.result,
            mimeType: file.type,
            alt: altText,
            filename: file.name,
            uploadedBy: currentUser ? currentUser.username : 'anonymous',
            uploadedAt: new Date().toISOString()
        };
        
        const media = JSON.parse(localStorage.getItem('media'));
        media[mediaId] = mediaData;
        localStorage.setItem('media', JSON.stringify(media));
        
        // Show preview
        const preview = document.getElementById('media-preview');
        preview.classList.remove('hidden');
        if (mediaType === 'image') {
            preview.innerHTML = `<img src="${mediaData.data}" style="max-width: 100%; height: auto;" alt="${altText}" />`;
        } else {
            preview.innerHTML = `<video controls style="max-width: 100%;"><source src="${mediaData.data}" type="${file.type}" /></video>`;
        }
        
        // Insert into active textarea
        insertMediaIntoTextarea(mediaId, mediaType);
        
        // Close modal after a short delay
        setTimeout(() => {
            document.getElementById('media-modal').classList.add('hidden');
        }, 2000);
    };
    
    reader.readAsDataURL(file);
}

function insertMediaIntoTextarea(mediaId, mediaType) {
    // Find the active textarea (last focused)
    const activeTextarea = document.activeElement;
    if (activeTextarea && activeTextarea.tagName === 'TEXTAREA') {
        const cursorPos = activeTextarea.selectionStart;
        const textBefore = activeTextarea.value.substring(0, cursorPos);
        const textAfter = activeTextarea.value.substring(cursorPos);
        const mediaTag = mediaType === 'image' ? `[image:${mediaId}]` : `[video:${mediaId}]`;
        activeTextarea.value = textBefore + mediaTag + textAfter;
        activeTextarea.focus();
        activeTextarea.setSelectionRange(cursorPos + mediaTag.length, cursorPos + mediaTag.length);
    } else {
        // Insert into main content if no textarea is focused
        const mainTextarea = document.getElementById('edit-main');
        if (mainTextarea) {
            const cursorPos = mainTextarea.selectionStart || mainTextarea.value.length;
            const textBefore = mainTextarea.value.substring(0, cursorPos);
            const textAfter = mainTextarea.value.substring(cursorPos);
            const mediaTag = mediaType === 'image' ? `[image:${mediaId}]` : `[video:${mediaId}]`;
            mainTextarea.value = textBefore + mediaTag + textAfter;
            mainTextarea.focus();
            mainTextarea.setSelectionRange(cursorPos + mediaTag.length, cursorPos + mediaTag.length);
        }
    }
}

// Manim Code Functions
function insertManimCode() {
    const activeTextarea = document.activeElement;
    const defaultCode = `from manim import *

class ExampleScene(Scene):
    def construct(self):
        # Your Manim code here
        circle = Circle()
        self.play(Create(circle))
`;
    
    const manimCode = prompt('Enter your Manim code:', defaultCode);
    if (manimCode) {
        const cursorPos = activeTextarea && activeTextarea.tagName === 'TEXTAREA' 
            ? activeTextarea.selectionStart 
            : (document.getElementById('edit-main')?.selectionStart || 0);
        
        const targetTextarea = (activeTextarea && activeTextarea.tagName === 'TEXTAREA') 
            ? activeTextarea 
            : document.getElementById('edit-main');
        
        if (targetTextarea) {
            const textBefore = targetTextarea.value.substring(0, cursorPos);
            const textAfter = targetTextarea.value.substring(cursorPos);
            const manimTag = `[manim:code]\n${manimCode}\n[/manim]`;
            targetTextarea.value = textBefore + manimTag + textAfter;
            targetTextarea.focus();
            targetTextarea.setSelectionRange(cursorPos + manimTag.length, cursorPos + manimTag.length);
        }
    }
}

function copyManimCode(codeId) {
    const codeBlock = document.querySelector(`[data-code-id="${codeId}"] code`);
    if (codeBlock) {
        const code = codeBlock.textContent;
        navigator.clipboard.writeText(code).then(() => {
            alert('Manim code copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = code;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Manim code copied to clipboard!');
        });
    }
}

// Interactive Code Functions
function insertInteractiveCode() {
    const activeTextarea = document.activeElement;
    const defaultCode = `// Example: Rotating circle
const ctx = MathAPI.createCanvas(400, 400);
let angle = 0;

function animate() {
    ctx.clearRect(0, 0, 400, 400);
    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fillStyle = '#0645ad';
    ctx.fill();
    ctx.restore();
    
    angle += 0.02;
    MathAPI.requestAnimationFrame(animate);
}

animate();`;
    
    const interactiveCode = prompt('Enter your interactive JavaScript code:', defaultCode);
    if (interactiveCode) {
        const cursorPos = activeTextarea && activeTextarea.tagName === 'TEXTAREA' 
            ? activeTextarea.selectionStart 
            : (document.getElementById('edit-main')?.selectionStart || 0);
        
        const targetTextarea = (activeTextarea && activeTextarea.tagName === 'TEXTAREA') 
            ? activeTextarea 
            : document.getElementById('edit-main');
        
        if (targetTextarea) {
            const textBefore = targetTextarea.value.substring(0, cursorPos);
            const textAfter = targetTextarea.value.substring(cursorPos);
            const interactiveTag = `[interactive:code]\n${interactiveCode}\n[/interactive]`;
            targetTextarea.value = textBefore + interactiveTag + textAfter;
            targetTextarea.focus();
            targetTextarea.setSelectionRange(cursorPos + interactiveTag.length, cursorPos + interactiveTag.length);
        }
    }
}

function reloadInteractive(interactiveId) {
    const iframe = document.getElementById(`iframe-${interactiveId}`);
    const codeDiv = document.getElementById(`code-${interactiveId}`);
    if (iframe && codeDiv) {
        const codeElement = codeDiv.querySelector('code');
        if (codeElement) {
            const code = codeElement.textContent;
            const htmlContent = generateInteractiveHTML(code, interactiveId);
            iframe.srcdoc = htmlContent;
        }
    }
}

function showInteractiveCode(interactiveId) {
    const codeDiv = document.getElementById(`code-${interactiveId}`);
    if (codeDiv) {
        codeDiv.classList.toggle('hidden');
    }
}

function insertEmbed() {
    const url = prompt('Enter the URL to embed (HTTPS only):', 'https://www.desmos.com/calculator');
    if (url) {
        const width = prompt('Width (default: 100%):', '100%');
        const height = prompt('Height (default: 600px):', '600px');
        const activeTextarea = document.activeElement;
        const cursorPos = activeTextarea && activeTextarea.tagName === 'TEXTAREA' 
            ? activeTextarea.selectionStart 
            : (document.getElementById('edit-main')?.selectionStart || 0);
        
        const targetTextarea = (activeTextarea && activeTextarea.tagName === 'TEXTAREA') 
            ? activeTextarea 
            : document.getElementById('edit-main');
        
        if (targetTextarea) {
            const textBefore = targetTextarea.value.substring(0, cursorPos);
            const textAfter = targetTextarea.value.substring(cursorPos);
            const embedTag = `[embed:${url}${width ? '|' + width : ''}${height ? '|' + height : ''}]`;
            targetTextarea.value = textBefore + embedTag + textAfter;
            targetTextarea.focus();
            targetTextarea.setSelectionRange(cursorPos + embedTag.length, cursorPos + embedTag.length);
        }
    }
}

// Make functions available globally for onclick handlers
window.reportSource = reportSource;
window.showABTests = showABTests;
window.submitABFeedback = submitABFeedback;
window.openMediaUpload = openMediaUpload;
window.insertManimCode = insertManimCode;
window.copyManimCode = copyManimCode;
window.insertInteractiveCode = insertInteractiveCode;
window.reloadInteractive = reloadInteractive;
window.showInteractiveCode = showInteractiveCode;
window.insertEmbed = insertEmbed;
window.createArticleFromSearch = createArticleFromSearch;

