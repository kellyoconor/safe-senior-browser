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
        
        // URL input
        const urlInput = document.getElementById('url-input');
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.navigate();
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
        
        indicator.classList.remove('safe', 'warning', 'danger');
        indicator.classList.add(safetyInfo.level);
        
        icon.textContent = safetyInfo.icon;
        text.textContent = safetyInfo.message;
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
