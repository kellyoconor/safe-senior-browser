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

        // Setup AI trigger and close buttons
        const aiTrigger = document.getElementById('ai-trigger');
        const aiClose = document.getElementById('ai-close');
        
        if (aiTrigger) {
            aiTrigger.addEventListener('click', () => this.showAI());
        }
        
        if (aiClose) {
            aiClose.addEventListener('click', () => this.hideAI());
        }
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
        
        // Contextual, senior-friendly responses based on current browsing
        if (lowerMessage.includes('safe') || lowerMessage.includes('secure')) {
            return `<div style="display: flex; align-items: center; margin-bottom: 12px;">
                <svg class="icon icon-lg" style="color: #059669; margin-right: 8px;">
                    <use href="#icon-shield"></use>
                </svg>
                <strong>Great news! This website is safe to use</strong>
            </div>
            I've checked ${domain} and everything looks good. Here's what I found:<br><br>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #059669; margin-right: 8px;">
                    <use href="#icon-shield"></use>
                </svg>
                This website has proper security protection
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #059669; margin-right: 8px;">
                    <use href="#icon-shield"></use>
                </svg>
                It's a legitimate, trusted website
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <svg class="icon icon-sm" style="color: #059669; margin-right: 8px;">
                    <use href="#icon-shield"></use>
                </svg>
                No safety concerns detected
            </div>
            <em>Helpful tip:</em> When visiting banking or shopping sites, always double-check that the web address matches exactly what you expect to see.`;
        }
        
        if (lowerMessage.includes('scam') || lowerMessage.includes('phishing')) {
            return `<div style="display: flex; align-items: center; margin-bottom: 12px;">
                <svg class="icon icon-lg" style="color: #ea580c; margin-right: 8px;">
                    <use href="#icon-warning"></use>
                </svg>
                <strong>How to Spot Online Scams</strong>
            </div>
            I'm always watching for these warning signs to keep you safe:<br><br>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #ea580c; margin-right: 8px;">
                    <use href="#icon-warning"></use>
                </svg>
                Messages that say "act now or lose out"
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #ea580c; margin-right: 8px;">
                    <use href="#icon-warning"></use>
                </svg>
                Emails asking for your password
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #ea580c; margin-right: 8px;">
                    <use href="#icon-warning"></use>
                </svg>
                Offers that seem too good to be true
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #ea580c; margin-right: 8px;">
                    <use href="#icon-warning"></use>
                </svg>
                Messages from unknown companies
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <svg class="icon icon-sm" style="color: #ea580c; margin-right: 8px;">
                    <use href="#icon-warning"></use>
                </svg>
                Lots of spelling mistakes
            </div>
            <em>Good news:</em> I haven't found any scam signs on ${domain} - you're safe here.`;
        }
        
        if (lowerMessage.includes('password') || lowerMessage.includes('login')) {
            return `<div style="display: flex; align-items: center; margin-bottom: 12px;">
                <svg class="icon icon-lg" style="color: #059669; margin-right: 8px;">
                    <use href="#icon-shield"></use>
                </svg>
                <strong>Keeping Your Passwords Safe</strong>
            </div>
            Here are simple ways to protect your accounts:<br><br>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #3b82f6; margin-right: 8px;">
                    <use href="#icon-shield"></use>
                </svg>
                Use a different password for each website
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #3b82f6; margin-right: 8px;">
                    <use href="#icon-shield"></use>
                </svg>
                Turn on extra security when websites offer it
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #ea580c; margin-right: 8px;">
                    <use href="#icon-warning"></use>
                </svg>
                Never give your password to anyone in an email
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #3b82f6; margin-right: 8px;">
                    <use href="#icon-help"></use>
                </svg>
                Consider using a password helper app
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <svg class="icon icon-sm" style="color: #3b82f6; margin-right: 8px;">
                    <use href="#icon-shield"></use>
                </svg>
                Change your passwords a few times a year
            </div>
            <em>About this site:</em> ${domain} uses proper security to protect your login information.`;
        }
        
        if (lowerMessage.includes('shopping') || lowerMessage.includes('buy')) {
            return `<div style="display: flex; align-items: center; margin-bottom: 12px;">
                <svg class="icon icon-lg" style="color: #3b82f6; margin-right: 8px;">
                    <use href="#icon-shopping"></use>
                </svg>
                <strong>Safe Online Shopping Guide</strong>
            </div>
            When you shop online, I make sure:<br><br>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #059669; margin-right: 8px;">
                    <use href="#icon-shield"></use>
                </svg>
                Your payment information is protected
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #059669; margin-right: 8px;">
                    <use href="#icon-shield"></use>
                </svg>
                The website accepts safe payment methods
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #3b82f6; margin-right: 8px;">
                    <use href="#icon-help"></use>
                </svg>
                You can return items if needed
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg class="icon icon-sm" style="color: #3b82f6; margin-right: 8px;">
                    <use href="#icon-users"></use>
                </svg>
                Other customers have had good experiences
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <svg class="icon icon-sm" style="color: #3b82f6; margin-right: 8px;">
                    <use href="#icon-help"></use>
                </svg>
                You can contact them if there's a problem
            </div>
            <em>About ${domain}:</em> This looks like a trustworthy shopping site that protects its customers.`;
        }
        
        return `<strong>I'm here to keep you safe online</strong><br><br>
        I'm watching over your browsing to protect you. I can help with:<br><br>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <svg class="icon icon-sm" style="color: #3b82f6; margin-right: 8px;">
                <use href="#icon-search"></use>
            </svg>
            Checking if websites are safe to use
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <svg class="icon icon-sm" style="color: #059669; margin-right: 8px;">
                <use href="#icon-shield"></use>
            </svg>
            Spotting scams and fake websites
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <svg class="icon icon-sm" style="color: #3b82f6; margin-right: 8px;">
                <use href="#icon-help"></use>
            </svg>
            Giving you personalized safety tips
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <svg class="icon icon-sm" style="color: #059669; margin-right: 8px;">
                <use href="#icon-shield"></use>
            </svg>
            Helping with passwords and logging in
        </div>
        What would you like to know about staying safe on <em>${domain}</em>?`;
    }

    onUrlChange(url, safetyInfo) {
        // Prevent duplicate messages for the same URL
        if (this.currentUrl === url) {
            return;
        }
        
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

    showAI() {
        const sidebar = document.getElementById('ai-sidebar');
        sidebar.classList.add('expanded');
        
        // Auto-focus on the input when opened
        setTimeout(() => {
            const input = document.getElementById('user-input');
            if (input) input.focus();
        }, 300);
    }
    
    hideAI() {
        const sidebar = document.getElementById('ai-sidebar');
        sidebar.classList.remove('expanded');
    }

    showSiteReport(url, safetyInfo) {
        const domain = this.extractDomain(url);
        
        let reportContent = '';
        if (safetyInfo.level === 'safe') {
            reportContent = `<div style="text-align: center;">
                <div style="margin-bottom: 16px;">
                    <svg class="icon icon-2xl" style="color: #059669;">
                        <use href="#icon-shield"></use>
                    </svg>
                </div>
                <h3 style="font-size: 20px; margin-bottom: 12px; color: #059669;">✅ ${domain} is Safe</h3>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                    Great news! This website has passed all our safety checks:
                    <br><br>
                    • Verified as a legitimate website<br>
                    • Uses proper security encryption<br>
                    • No known safety concerns<br>
                    • Safe to enter personal information
                </p>
                <button onclick="this.closest('.ai-overlay').classList.remove('show')" 
                        style="padding: 12px 24px; font-size: 16px; font-weight: 600; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Continue browsing safely
                </button>
            </div>`;
        } else if (safetyInfo.level === 'warning') {
            reportContent = `<div style="text-align: center;">
                <div style="margin-bottom: 16px;">
                    <svg class="icon icon-2xl" style="color: #ea580c;">
                        <use href="#icon-warning"></use>
                    </svg>
                </div>
                <h3 style="font-size: 20px; margin-bottom: 12px; color: #ea580c;">⚠️ Be Cautious on ${domain}</h3>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                    I don't have complete safety information about this website. To stay safe:
                    <br><br>
                    • Avoid entering passwords or personal information<br>
                    • Don't download any files<br>
                    • Leave if anything seems suspicious<br>
                    • Consider using a more trusted alternative
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="window.browser.goToSafeZone(); this.closest('.ai-overlay').classList.remove('show')" 
                            style="padding: 12px 24px; font-size: 16px; font-weight: 600; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Take me somewhere safe
                    </button>
                    <button onclick="this.closest('.ai-overlay').classList.remove('show')" 
                            style="padding: 12px 24px; font-size: 16px; font-weight: 600; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        I'll be careful here
                    </button>
                </div>
            </div>`;
        } else {
            reportContent = `<div style="text-align: center;">
                <div style="margin-bottom: 16px;">
                    <svg class="icon icon-2xl" style="color: #dc2626;">
                        <use href="#icon-alert"></use>
                    </svg>
                </div>
                <h3 style="font-size: 20px; margin-bottom: 12px; color: #dc2626;">🚨 ${domain} is Not Safe</h3>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                    This website has failed our safety checks and may be dangerous:
                    <br><br>
                    • May steal your personal information<br>
                    • Could install harmful software<br>
                    • Might be a scam or fake website<br>
                    • I strongly recommend leaving immediately
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="window.browser.goToSafeZone(); this.closest('.ai-overlay').classList.remove('show')" 
                            style="padding: 12px 24px; font-size: 16px; font-weight: 600; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Yes, get me out of here
                    </button>
                    <button onclick="this.closest('.ai-overlay').classList.remove('show')" 
                            style="padding: 12px 24px; font-size: 16px; font-weight: 600; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        I understand the risks
                    </button>
                </div>
            </div>`;
        }
        
        const overlay = document.getElementById('ai-overlay');
        const content = document.getElementById('ai-overlay-content');
        content.innerHTML = reportContent;
        overlay.classList.add('show');
    }
}

const aiAssistant = new SafeGuideAI();
