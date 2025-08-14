// SafeHarbor Browser Logic
class SafeHarborBrowser {
    constructor() {
        this.webview = null;
        this.currentUrl = '';
        this.safetyData = this.loadMockSafetyData();
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        this.webview = document.getElementById('webview');
        
        // Navigation buttons
        document.getElementById('back-button').addEventListener('click', () => this.goBack());
        document.getElementById('forward-button').addEventListener('click', () => this.goForward());
        document.getElementById('home-button').addEventListener('click', () => this.goHome());
        document.getElementById('go-button').addEventListener('click', () => this.navigate());
        
        // Smart URL input with suggestions
        const urlInput = document.getElementById('url-input');
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.navigate();
        });
        
        urlInput.addEventListener('input', (e) => {
            this.showSmartSuggestions(e.target.value);
        });
        
        urlInput.addEventListener('focus', () => {
            if (urlInput.value.length > 2) {
                this.showSmartSuggestions(urlInput.value);
            }
        });
        
        urlInput.addEventListener('blur', () => {
            // Hide suggestions after a delay to allow clicking
            setTimeout(() => this.hideSuggestions(), 200);
        });
        
        // Webview events
        if (this.webview) {
            this.webview.addEventListener('did-start-loading', () => this.onStartLoading());
            this.webview.addEventListener('did-stop-loading', () => this.onStopLoading());
            this.webview.addEventListener('did-navigate', (e) => this.onNavigate(e.url));
        }

        // Accessibility controls
        document.getElementById('font-size-toggle').addEventListener('click', () => this.toggleFontSize());
        document.getElementById('contrast-toggle').addEventListener('click', () => this.toggleContrast());
        
        // Bookmarks
        document.getElementById('bookmarks-button').addEventListener('click', () => this.showBookmarks());
        
        // Help
        document.getElementById('help-button').addEventListener('click', () => this.showHelp());
        
        // Initial safety check
        this.checkSafety('https://amazon.com');
    }

    navigate() {
        let url = document.getElementById('url-input').value.trim();
        if (!url) return;
        
        if (!url.match(/^https?:\/\//)) {
            url = 'https://' + url;
        }
        
        this.webview.src = url;
        this.checkSafety(url);
    }

    goBack() {
        if (this.webview && this.webview.canGoBack()) {
            this.webview.goBack();
        }
    }

    goForward() {
        if (this.webview && this.webview.canGoForward()) {
            this.webview.goForward();
        }
    }

    goHome() {
        const homeUrl = 'https://www.google.com';
        this.webview.src = homeUrl;
        document.getElementById('url-input').value = homeUrl;
        this.checkSafety(homeUrl);
    }

    onStartLoading() {
        document.getElementById('go-button').textContent = '...';
    }

    onStopLoading() {
        document.getElementById('go-button').textContent = 'Go';
        this.updateNavigationButtons();
    }

    onNavigate(url) {
        this.currentUrl = url;
        document.getElementById('url-input').value = url;
        this.checkSafety(url);
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const backBtn = document.getElementById('back-button');
        const forwardBtn = document.getElementById('forward-button');
        
        if (this.webview) {
            backBtn.disabled = !this.webview.canGoBack();
            forwardBtn.disabled = !this.webview.canGoForward();
        }
    }

    checkSafety(url) {
        const domain = this.extractDomain(url);
        const safetyInfo = this.getSafetyInfo(domain);
        this.updateSafetyIndicator(safetyInfo);
        
        if (window.aiAssistant) {
            window.aiAssistant.onUrlChange(url, safetyInfo);
        }
    }

    extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    }

    getSafetyInfo(domain) {
        if (this.safetyData.safe.includes(domain)) {
            return { level: 'safe', message: 'Safe Site', icon: '🛡️' };
        } else if (this.safetyData.warning.some(w => domain.includes(w))) {
            return { level: 'warning', message: 'Use Caution', icon: '⚠️' };
        } else if (this.safetyData.danger.some(d => domain.includes(d))) {
            return { level: 'danger', message: 'Potentially Unsafe', icon: '🚨' };
        } else {
            return { level: 'safe', message: 'Checking...', icon: '🔍' };
        }
    }

    updateSafetyIndicator(safetyInfo) {
        const indicator = document.getElementById('safety-indicator');
        const icon = indicator.querySelector('.safety-icon');
        const text = indicator.querySelector('.safety-text');
        
        // Add updating animation
        indicator.classList.add('updating');
        
        setTimeout(() => {
            // Remove existing classes
            indicator.classList.remove('safe', 'warning', 'danger', 'updating');
            
            // Add new class
            indicator.classList.add(safetyInfo.level);
            
            // Update content with smooth transition
            icon.textContent = safetyInfo.icon;
            text.textContent = safetyInfo.message;
            
            // Show contextual overlay for warnings/dangers
            if (safetyInfo.level !== 'safe') {
                this.showContextualAlert(safetyInfo);
            }
        }, 500);
    }

    toggleFontSize() {
        const currentSize = parseInt(getComputedStyle(document.body).fontSize);
        const newSize = currentSize >= 20 ? 16 : currentSize + 2;
        document.body.style.fontSize = newSize + 'px';
    }

    toggleContrast() {
        document.body.classList.toggle('high-contrast');
    }

    showBookmarks() {
        const bookmarks = [
            { name: 'Amazon', url: 'https://amazon.com' },
            { name: 'AARP', url: 'https://aarp.org' },
            { name: 'Medicare', url: 'https://medicare.gov' }
        ];
        
        this.webview.src = bookmarks[0].url;
        document.getElementById('url-input').value = bookmarks[0].url;
        this.checkSafety(bookmarks[0].url);
    }

    showHelp() {
        if (window.aiAssistant) {
            window.aiAssistant.showHelp();
        }
    }

    showSmartSuggestions(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        const suggestions = this.generateSuggestions(query);
        const suggestionsContainer = document.getElementById('address-suggestions');
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        suggestionsContainer.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" data-url="${suggestion.url}">
                <div class="suggestion-icon ${suggestion.safety}">
                    ${suggestion.icon}
                </div>
                <div class="suggestion-text">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-description">${suggestion.description}</div>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.getAttribute('data-url');
                document.getElementById('url-input').value = url;
                this.navigate();
                this.hideSuggestions();
            });
        });
        
        suggestionsContainer.style.display = 'block';
    }
    
    generateSuggestions(query) {
        const lowerQuery = query.toLowerCase();
        const suggestions = [];
        
        // Safe site suggestions
        const safeSites = [
            { domain: 'amazon.com', title: 'Amazon', description: 'Trusted online shopping' },
            { domain: 'aarp.org', title: 'AARP', description: 'Resources for seniors' },
            { domain: 'medicare.gov', title: 'Medicare', description: 'Official health information' },
            { domain: 'ssa.gov', title: 'Social Security', description: 'Government services' },
            { domain: 'apple.com', title: 'Apple', description: 'Technology and support' },
            { domain: 'microsoft.com', title: 'Microsoft', description: 'Software and services' }
        ];
        
        safeSites.forEach(site => {
            if (site.domain.includes(lowerQuery) || site.title.toLowerCase().includes(lowerQuery)) {
                suggestions.push({
                    url: `https://www.${site.domain}`,
                    title: site.title,
                    description: site.description,
                    icon: '🛡️',
                    safety: 'suggestion-safe'
                });
            }
        });
        
        // Add search suggestion if it doesn't look like a URL
        if (!lowerQuery.includes('.') && suggestions.length < 3) {
            suggestions.unshift({
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                title: `Search for "${query}"`,
                description: 'Safe Google search',
                icon: '🔍',
                safety: 'suggestion-safe'
            });
        }
        
        return suggestions.slice(0, 5);
    }
    
    hideSuggestions() {
        const suggestionsContainer = document.getElementById('address-suggestions');
        suggestionsContainer.style.display = 'none';
    }
    
    showContextualAlert(safetyInfo) {
        const overlay = document.getElementById('ai-overlay');
        const content = document.getElementById('ai-overlay-content');
        
        const alertContent = safetyInfo.level === 'warning' 
            ? `<h3>⚠️ Proceed with Caution</h3>
               <p>I don't have complete safety information about this site. Please be extra careful and avoid entering personal information.</p>
               <div style="margin-top: 16px; display: flex; gap: 8px;">
                   <button onclick="this.closest('.ai-overlay').classList.remove('show')" 
                           style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                       I'll be careful
                   </button>
                   <button onclick="window.browser.goBack(); this.closest('.ai-overlay').classList.remove('show')" 
                           style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
                       Go back
                   </button>
               </div>`
            : `<h3>🚨 Security Warning</h3>
               <p>This site may not be safe. I recommend leaving immediately to protect your personal information.</p>
               <div style="margin-top: 16px; display: flex; gap: 8px;">
                   <button onclick="window.browser.goBack(); this.closest('.ai-overlay').classList.remove('show')" 
                           style="padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">
                       Leave site
                   </button>
                   <button onclick="this.closest('.ai-overlay').classList.remove('show')" 
                           style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
                       Ignore warning
                   </button>
               </div>`;
        
        content.innerHTML = alertContent;
        overlay.classList.add('show');
    }

    loadMockSafetyData() {
        return {
            safe: [
                'amazon.com', 'google.com', 'aarp.org', 'medicare.gov', 
                'ssa.gov', 'apple.com', 'microsoft.com', 'walmart.com'
            ],
            warning: ['unknown-site', 'new-domain'],
            danger: ['scam', 'phishing', 'malware']
        };
    }
}

const browser = new SafeHarborBrowser();
