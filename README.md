# SafeBrowser Mini-Browser

Premium web browser prototype designed specifically for adults aged 65+ with integrated AI safety assistance and comprehensive onboarding system.

## Features

### 🎯 Welcome Onboarding Tour
- **Interactive 6-step guided walkthrough** covering all key safety features
- **Progress tracking** with step counter and animated progress bar
- **Senior-friendly messaging** with warm, conversational tone
- **Eye-catching tour button** with blue gradient and pulse animation
- **Professional tooltips** with premium styling and transparency effects

### 🛡️ AI Safety Assistant (SafeGuide)
- **Persistent AI chat panel** (35% screen width, collapsible)
- **Real-time safety guidance** and website verification
- **Conversational interface** designed for seniors
- **Tour completion celebration** with welcome message

### 🌐 Secure Browsing
- **Visual safety indicators** (green/yellow/red) for all websites
- **Quick action buttons**: "Check Site" and "Safe Zone" 
- **Form protection system** with user confirmation flows
- **Link preview tooltips** with safety information

### ♿ Accessibility Features
- **Font size toggle** for easier reading
- **High contrast mode** for better visibility  
- **Link previews** to see destinations before clicking
- **Large click targets** and senior-friendly design

## Quick Start
```bash
npm install
npm start
```

## Architecture
- **Frontend**: HTML/CSS/JavaScript with Intro.js for tours
- **Backend**: Electron for desktop app framework
- **AI Integration**: Mock responses (extensible to OpenAI)
- **Safety Data**: Mock threat detection (extensible to real APIs)

## Tour System
The onboarding tour guides users through:
1. SafeBrowser introduction and branding
2. AI Assistant (SafeGuide) overview
3. Safety indicator explanation
4. Address bar navigation
5. Quick action buttons
6. Accessibility feature showcase

## Browser Layout
- **Browser Panel**: 65% of screen width for web browsing
- **AI Panel**: 35% of screen width (collapsible to 60px)
- **Premium Design**: Transparency effects, backdrop blur, modern styling

Built with Electron for desktop. Optimized for macOS with cross-platform compatibility.
