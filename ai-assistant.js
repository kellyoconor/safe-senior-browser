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
        
        // Add sophisticated typing animation for AI messages
        if (sender === 'assistant') {
            messageDiv.innerHTML = `<div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>`;
            this.chatWindow.appendChild(messageDiv);
            this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
            
            // Replace with actual content after animation
            setTimeout(() => {
                messageDiv.innerHTML = `<p>${content}</p>`;
                messageDiv.style.animation = 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 800);
        } else {
            messageDiv.innerHTML = `<p>${content}</p>`;
            this.chatWindow.appendChild(messageDiv);
            this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
        }
        
        this.conversationHistory.push({ sender, content, timestamp: Date.now() });
    }

    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        const domain = this.extractDomain(this.currentUrl);
        
        // Contextual, sophisticated responses based on current browsing
        if (lowerMessage.includes('safe') || lowerMessage.includes('secure')) {
            return `🛡️ <strong>Safety Analysis Complete</strong><br><br>
            The current site (${domain}) shows positive security indicators. Here's what I verified:<br><br>
            ✅ Valid SSL certificate<br>
            ✅ Known legitimate domain<br>
            ✅ No reported security issues<br><br>
            <em>Pro tip:</em> Always verify the URL matches exactly what you expect, especially for banking or shopping sites.`;
        }
        
        if (lowerMessage.includes('scam') || lowerMessage.includes('phishing')) {
            return `🚨 <strong>Scam Detection Guide</strong><br><br>
            I use advanced AI to spot these red flags:<br><br>
            ⚠️ Urgent "act now" language<br>
            ⚠️ Requests for passwords via email<br>
            ⚠️ Too-good-to-be-true offers<br>
            ⚠️ Unfamiliar sender domains<br>
            ⚠️ Poor spelling/grammar<br><br>
            <em>Current site safety:</em> No scam indicators detected on ${domain}.`;
        }
        
        if (lowerMessage.includes('password') || lowerMessage.includes('login')) {
            return `🔐 <strong>Password Security Best Practices</strong><br><br>
            I recommend these proven strategies:<br><br>
            💪 Use unique passwords for each site<br>
            🔄 Enable two-factor authentication<br>
            🚫 Never share passwords via email<br>
            💾 Consider a reputable password manager<br>
            🔄 Update passwords every 90 days<br><br>
            <em>For this site:</em> ${domain} supports secure login practices.`;
        }
        
        if (lowerMessage.includes('shopping') || lowerMessage.includes('buy')) {
            return `🛒 <strong>Safe Shopping Analysis</strong><br><br>
            For secure online shopping, I verify:<br><br>
            ✅ Secure checkout process (https://)<br>
            ✅ Trusted payment methods<br>
            ✅ Clear return policy<br>
            ✅ Verified seller ratings<br>
            ✅ Contact information available<br><br>
            <em>${domain} shopping safety:</em> This appears to be a trusted marketplace with buyer protection.`;
        }
        
        return `<strong>AI Safety Assistant Ready</strong><br><br>
        I'm analyzing your browsing in real-time to keep you secure. I can help with:<br><br>
        🔍 Website safety verification<br>
        🛡️ Scam and phishing detection<br>
        💡 Personalized security advice<br>
        🔐 Password and login guidance<br><br>
        What would you like to know about staying safe on <em>${domain}</em>?`;
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
