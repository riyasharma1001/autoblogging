const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // SEO and Site Identity
  siteName: { 
    type: String, 
    required: true, 
    default: 'My CMS'
  },
  siteUrl: { 
    type: String, 
    required: true, 
    default: 'http://localhost:3000' 
  },
  logoUrl: { 
    type: String,
    default: '' 
  },
  authorName: { 
    type: String, 
    default: 'Gagan Chaudhary' 
  },
  organizationName: { 
    type: String,
    default: '' 
  },

  // API Keys and Analytics
  openaiKey: { 
    type: String,
    default: '' 
  },
  ga4Id: { 
    type: String,
    default: '' 
  },
  adsenseId: { 
    type: String,
    default: '' 
  },
  
  // Integration Codes
  publyticsCode: { 
    type: String,
    default: '' 
  },
  
  // SEO Configuration Files
  sitemapConfig: { 
    type: String,
    default: '' 
  },
  robotsTxt: { 
    type: String,
    default: '' 
  },
  adsTxt: { 
    type: String,
    default: '' 
  },

  // Search Engine Verification
  bingVerificationId: { 
    type: String,
    default: '' 
  },

  // Custom Head Code
  customHeadCode: {
    type: String,
    default: ''
  },
}, {
  timestamps: true
});

module.exports = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);