// SafeGuide AI Assistant
class SafeGuideAI {
    constructor() {
        this.chatWindow = null;
        this.userInput = null;
        this.sendButton = null;
        this.currentUrl = '';
        this.conversationHistory = [];
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
        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');

        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        document.getElementById('ai-toggle').addEventListener('click', () => this.toggleSidebar());
        this.setupRecommendedSites();
        window.aiAssistant = this;
    }

    setupRecommendedSites() {
        const recommendedLinks = document.querySelectorAll('.recommended-sites a');
        recommendedLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = link.getAttribute('data-url');
                if (url) {
                    document.getElementById('url-input').value = url;
                    document.getElementById('webview').src = url;
                    if (window.browser) {
                        window.browser.checkSafety(url);
                    }
                }
            });
        });
    }

    sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.userInput.value = '';

        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage(response, 'assistant');
        }, 500);
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);
        messageDiv.innerHTML = `<p>${content}</p>`;
        this.chatWindow.appendChild(messageDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
        this.conversationHistory.push({ sender, content, timestamp: Date.now() });
    }

    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('safe') || lowerMessage.includes('secure')) {
            return `🛡️ Great question about safety! The current site appears legitimate. Always look for https:// and be cautious with personal information.`;
        }
        
        if (lowerMessage.includes('scam') || lowerMessage.includes('phishing')) {
            return `🚨 Watch for these scam signs: urgent language, requests for passwords via email, too-good-to-be-true offers, and unfamiliar senders.`;
        }
        
        if (lowerMessage.includes('password')) {
            return `🔐 Password tips: Use unique passwords for each site, enable two-factor authentication, and never share passwords via email.`;
        }
        
        return `Thanks for your question! I'm here to help with internet safety. Is there anything specific about browsing safely you'd like to know?`;
    }

    onUrlChange(url, safetyInfo) {
        this.currentUrl = url;
        const domain = this.extractDomain(url);
        
        setTimeout(() => {
            let message = '';
            
            if (safetyInfo.level === 'safe') {
                message = `✅ You've navigated to ${domain}. This is a trusted website. Browse safely!`;
            } else if (safetyInfo.level === 'warning') {
                message = `⚠️ You're on ${domain}. Please be cautious and avoid entering personal information.`;
            } else if (safetyInfo.level === 'danger') {
                message = `🚨 WARNING: ${domain} may not be safe! Consider leaving this site.`;
            }
            
            if (message) {
                this.addMessage(message, 'assistant');
            }
        }, 1000);
    }

    extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    }

    showHelp() {
        const helpMessage = `🆘 <strong>SafeHarbor Browser Help</strong><br><br>
        🛡️ Safety indicators: Green=Safe, Yellow=Caution, Red=Danger<br>
        🔧 Use Back/Forward/Home buttons for navigation<br>
        💬 Ask me about website safety anytime!<br>
        �� I can help with passwords and security tips`;
        
        this.addMessage(helpMessage, 'assistant');
    }

    toggleSidebar() {
        const sidebar = document.getElementById('ai-sidebar');
        const toggleButton = document.getElementById('ai-toggle');
        
        sidebar.classList.toggle('collapsed');
        
        // Update button text based on state
        if (sidebar.classList.contains('collapsed')) {
            toggleButton.textContent = '←';
            toggleButton.title = 'Expand SafeGuide';
        } else {
            toggleButton.textContent = '→';
            toggleButton.title = 'Collapse SafeGuide';
        }
    }
}

const aiAssistant = new SafeGuideAI();
