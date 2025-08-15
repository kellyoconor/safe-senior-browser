// SafeHarbor Browser Logic
class SafeHarborBrowser {
    constructor() {
        this.webview = null;
        this.currentUrl = '';
        this.safetyData = this.loadMockSafetyData();
        this.linkPreviewsEnabled = true; // Default on for safety
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
        document.getElementById('link-preview-toggle').addEventListener('click', () => this.toggleLinkPreviews());
        
        // Quick Actions
        document.getElementById('check-site-button').addEventListener('click', () => this.checkCurrentSite());
        document.getElementById('safe-zone-button').addEventListener('click', () => this.goToSafeZone());
        
        // Bookmarks
        document.getElementById('bookmarks-button').addEventListener('click', () => this.showBookmarks());
        
        // Help
        document.getElementById('help-button').addEventListener('click', () => this.showHelp());
        
        // Initial safety check
        this.checkSafety('https://amazon.com');
        
        // Setup form protection
        this.setupFormProtection();
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
        // Update URL input to show loading state
        const urlInput = document.getElementById('url-input');
        urlInput.style.opacity = '0.6';
    }

    onStopLoading() {
        // Reset URL input
        const urlInput = document.getElementById('url-input');
        urlInput.style.opacity = '1';
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
            return { 
                level: 'safe', 
                message: 'Safe', 
                ribbonMessage: `I'll keep watch while you browse - You're safely on ${domain}`,
                iconId: 'icon-shield' 
            };
        } else if (this.safetyData.warning.some(w => domain.includes(w))) {
            return { 
                level: 'warning', 
                message: "Caution", 
                ribbonMessage: "I don't have complete info on this site - Let's be extra cautious",
                iconId: 'icon-warning' 
            };
        } else if (this.safetyData.danger.some(d => domain.includes(d))) {
            return { 
                level: 'danger', 
                message: "Unsafe", 
                ribbonMessage: "This site looks risky - I suggest we go somewhere safer",
                iconId: 'icon-alert' 
            };
        } else {
            return { 
                level: 'safe', 
                message: 'Checking...', 
                ribbonMessage: "I'm checking this site to make sure it's safe - Just a moment",
                iconId: 'icon-search' 
            };
        }
    }

    updateSafetyIndicator(safetyInfo) {
        const indicator = document.getElementById('safety-indicator');
        const icon = indicator.querySelector('.safety-icon use');
        const text = indicator.querySelector('.safety-text');
        
        // Add updating animation
        indicator.classList.add('updating');
        
        setTimeout(() => {
            // Update main safety indicator
            indicator.classList.remove('safe', 'warning', 'danger', 'updating');
            indicator.classList.add(safetyInfo.level);
            icon.setAttribute('href', `#${safetyInfo.iconId}`);
            text.textContent = safetyInfo.message;
            
            // Show contextual overlay for warnings/dangers
            if (safetyInfo.level !== 'safe') {
                this.showContextualAlert(safetyInfo);
            }
        }, 500);
    }

    toggleFontSize() {
        const currentSize = parseInt(getComputedStyle(document.body).fontSize);
        const newSize = currentSize >= 24 ? 16 : currentSize + 2;
        document.body.style.fontSize = newSize + 'px';
        
        // Show friendly feedback
        const button = document.getElementById('font-size-toggle');
        const originalText = button.textContent;
        button.textContent = newSize >= 24 ? 'Reset' : `${newSize}px`;
        setTimeout(() => button.textContent = originalText, 1000);
    }

    toggleContrast() {
        document.body.classList.toggle('high-contrast');
        
        // Show friendly feedback
        const button = document.getElementById('contrast-toggle');
        const isHighContrast = document.body.classList.contains('high-contrast');
        button.textContent = isHighContrast ? '●○' : '◐';
        button.title = isHighContrast ? 'Switch to normal contrast' : 'Switch to high contrast';
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
                    <svg class="icon icon-sm">
                        <use href="#${suggestion.iconId}"></use>
                    </svg>
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
                    iconId: 'icon-shield',
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
                iconId: 'icon-search',
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
            ? `<div style="text-align: center;">
                   <div style="margin-bottom: 16px;">
                       <svg class="icon icon-2xl" style="color: #ea580c;">
                           <use href="#icon-warning"></use>
                       </svg>
                   </div>
                   <h3 style="font-size: 20px; margin-bottom: 12px; color: #ea580c;">Please be extra careful here</h3>
                   <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                       I don't have complete safety information about this website. To protect yourself:
                       <br><br>
                       &bull; Don't enter passwords or personal information<br>
                       &bull; Be cautious of any download requests<br>
                       &bull; Leave if anything seems suspicious
                   </p>
                   <div style="display: flex; gap: 12px; justify-content: center;">
                       <button onclick="this.closest('.ai-overlay').classList.remove('show')" 
                               style="padding: 12px 24px; font-size: 16px; font-weight: 600; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                           I understand, continue
                       </button>
                       <button onclick="window.browser.goBack(); this.closest('.ai-overlay').classList.remove('show')" 
                               style="padding: 12px 24px; font-size: 16px; font-weight: 600; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer;">
                           Take me back to safety
                       </button>
                   </div>
               </div>`
            : `<div style="text-align: center;">
                   <div style="margin-bottom: 16px;">
                       <svg class="icon icon-2xl" style="color: #dc2626;">
                           <use href="#icon-alert"></use>
                       </svg>
                   </div>
                   <h3 style="font-size: 20px; margin-bottom: 12px; color: #dc2626;">This website may not be safe</h3>
                   <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                       For your protection, I strongly recommend leaving this site immediately. 
                       This website might try to:
                       <br><br>
                       &bull; Steal your personal information<br>
                       &bull; Install harmful software<br>
                       &bull; Trick you into sharing passwords
                   </p>
                   <div style="display: flex; gap: 12px; justify-content: center;">
                       <button onclick="window.browser.goBack(); this.closest('.ai-overlay').classList.remove('show')" 
                               style="padding: 12px 24px; font-size: 16px; font-weight: 600; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer;">
                           Yes, take me to safety
                       </button>
                       <button onclick="this.closest('.ai-overlay').classList.remove('show')" 
                               style="padding: 12px 24px; font-size: 16px; font-weight: 600; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer;">
                           I'll stay but be careful
                       </button>
                   </div>
               </div>`;
        
        content.innerHTML = alertContent;
        overlay.classList.add('show');
    }

    loadMockSafetyData() {
        return {
            safe: [
                'amazon.com', 'google.com', 'aarp.org', 'medicare.gov', 
                'ssa.gov', 'apple.com', 'microsoft.com', 'walmart.com', 'xfinity.com'
            ],
            warning: ['unknown-site', 'new-domain'],
            danger: ['scam', 'phishing', 'malware']
        };
    }

    // Quick Actions
    checkCurrentSite() {
        const domain = this.extractDomain(this.currentUrl);
        const safetyInfo = this.getSafetyInfo(domain);
        
        if (window.aiAssistant) {
            window.aiAssistant.showSiteReport(this.currentUrl, safetyInfo);
        }
    }

    goToSafeZone() {
        const safeUrl = 'https://xfinity.com';
        this.webview.src = safeUrl;
        document.getElementById('url-input').value = safeUrl;
        this.checkSafety(safeUrl);
    }

    // Link Previews
    toggleLinkPreviews() {
        this.linkPreviewsEnabled = !this.linkPreviewsEnabled;
        
        const button = document.getElementById('link-preview-toggle');
        button.style.opacity = this.linkPreviewsEnabled ? '1' : '0.5';
        button.title = this.linkPreviewsEnabled ? 'Disable Link Previews' : 'Enable Link Previews';
        
        if (this.linkPreviewsEnabled) {
            this.setupLinkPreviews();
        } else {
            this.removeLinkPreviews();
        }
    }

    setupLinkPreviews() {
        // This will be called when webview content changes
        if (this.webview) {
            this.webview.addEventListener('dom-ready', () => {
                this.injectLinkPreviewScript();
            });
        }
    }

    removeLinkPreviews() {
        const tooltip = document.getElementById('link-preview-tooltip');
        tooltip.classList.remove('show');
    }

    injectLinkPreviewScript() {
        if (!this.linkPreviewsEnabled) return;
        
        // Inject script into webview to handle link hover events
        const script = `
            let hoverTimeout;
            let tooltip = null;
            
            document.addEventListener('mouseover', (e) => {
                if (e.target.tagName === 'A' && e.target.href) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = setTimeout(() => {
                        window.chrome.webview?.postMessage({
                            type: 'link-hover',
                            url: e.target.href,
                            x: e.clientX,
                            y: e.clientY
                        });
                    }, 500);
                }
            });
            
            document.addEventListener('mouseout', (e) => {
                if (e.target.tagName === 'A') {
                    clearTimeout(hoverTimeout);
                    window.chrome.webview?.postMessage({
                        type: 'link-unhover'
                    });
                }
            });
        `;
        
        this.webview.executeJavaScript(script);
    }

    // Form Protection
    setupFormProtection() {
        if (this.webview) {
            this.webview.addEventListener('dom-ready', () => {
                this.injectFormProtectionScript();
            });
        }
    }

    injectFormProtectionScript() {
        const script = `
            const sensitiveSelectors = [
                'input[type="password"]',
                'input[name*="password"]',
                'input[name*="email"]',
                'input[name*="phone"]',
                'input[name*="ssn"]',
                'input[name*="credit"]',
                'input[name*="card"]',
                'input[name*="cvv"]',
                'input[name*="security"]',
                'input[type="email"]',
                'input[type="tel"]'
            ];
            
            let formProtectionActive = false;
            
            function checkSensitiveField(element) {
                if (formProtectionActive) return;
                
                const isSensitive = sensitiveSelectors.some(selector => {
                    try {
                        return element.matches(selector);
                    } catch (e) {
                        return false;
                    }
                });
                
                if (isSensitive) {
                    formProtectionActive = true;
                    window.chrome.webview?.postMessage({
                        type: 'sensitive-field-focus',
                        fieldType: element.type || 'text',
                        fieldName: element.name || '',
                        placeholder: element.placeholder || ''
                    });
                }
            }
            
            // Monitor focus events on all input fields
            document.addEventListener('focusin', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                    checkSensitiveField(e.target);
                }
            });
            
            // Reset protection when navigating away
            window.addEventListener('beforeunload', () => {
                formProtectionActive = false;
            });
        `;
        
        this.webview.executeJavaScript(script);
        
        // Listen for messages from the webview
        this.webview.addEventListener('ipc-message', (event) => {
            if (event.channel === 'form-protection') {
                this.showFormProtectionDialog(event.args[0]);
            }
        });
    }

    showFormProtectionDialog(fieldInfo) {
        const domain = this.extractDomain(this.currentUrl);
        const safetyInfo = this.getSafetyInfo(domain);
        
        let protectionContent = `<div style="text-align: center;">
            <div style="margin-bottom: 16px;">
                <svg class="icon icon-2xl" style="color: #ea580c;">
                    <use href="#icon-warning"></use>
                </svg>
            </div>
            <h3 style="font-size: 20px; margin-bottom: 12px; color: #ea580c;">🔒 Personal Information Detected</h3>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                I notice you're about to enter personal information on ${domain}. 
                <br><br>
                Would you like me to check if this site is safe first?
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="window.browser.checkCurrentSite(); this.closest('.ai-overlay').classList.remove('show')" 
                        style="padding: 12px 24px; font-size: 16px; font-weight: 600; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Yes, check this site first
                </button>
                <button onclick="this.closest('.ai-overlay').classList.remove('show')" 
                        style="padding: 12px 24px; font-size: 16px; font-weight: 600; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    I trust this site, continue
                </button>
            </div>
        </div>`;
        
        const overlay = document.getElementById('form-protection-overlay');
        const content = document.getElementById('form-protection-content');
        content.innerHTML = protectionContent;
        overlay.classList.add('show');
    }
}

const browser = new SafeHarborBrowser();
