// Configuration for different deployment environments
//
// DEPLOYMENT INSTRUCTIONS:
// 1. Deploy backend to Render using server.js
// 2. Get your Render backend URL (e.g. https://your-app.onrender.com)  
// 3. Update the URL below in the github.io section
// 4. Deploy frontend to GitHub Pages (frontend files only)
//
const config = {
    // Backend API URL - automatically detects environment
    getApiUrl: function() {
        // If running on GitHub Pages (*.github.io domain)
        if (window.location.hostname.includes('github.io')) {
            // Replace with your actual Render backend URL
            // Example: 'https://your-tambola-backend.onrender.com'
            return 'https://tambola-backend.onrender.com';
        }
        // If running locally
        else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `http://localhost:3000`;
        }
        // Default to current domain (for backward compatibility)
        else {
            return window.location.origin;
        }
    },
    
    // Socket.IO URL (same as API URL)
    getSocketUrl: function() {
        return this.getApiUrl();
    }
};

// Make config available globally
window.TambolaConfig = config;