const mongoose = require('mongoose');

const PostAnalyticsSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  postTitle: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  googleCrawlerVisits: {
    type: Number,
    default: 0
  },
  googlebotVisits: {
    type: Number,
    default: 0
  },
  adsenseBotVisits: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.PostAnalytics || mongoose.model('PostAnalytics', PostAnalyticsSchema);