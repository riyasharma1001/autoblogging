import { connectToDatabase } from '../../../utils/db';
import Post from '../../../models/Post';
import PostAnalytics from '../../../models/PostAnalytics';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const { slug, userAgent } = req.body;
    const post = await Post.findOne({ slug });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Find or create analytics
    let analytics = await PostAnalytics.findOne({ postId: post._id });
    
    if (!analytics) {
      analytics = await PostAnalytics.create({
        postId: post._id,
        postTitle: post.title,
        views: 0,
        googleCrawlerVisits: 0,
        googlebotVisits: 0,
        adsenseBotVisits: 0,
        lastUpdated: new Date()
      });
    }

    // Update counts based on user agent
    const update = { lastUpdated: new Date() };

    if (userAgent.includes('googlebot')) {
      update.$inc = { googlebotVisits: 1 };
    } else if (userAgent.includes('adsbot-google')) {
      update.$inc = { adsenseBotVisits: 1 };
    } else if (userAgent.includes('google') && !userAgent.includes('bot')) {
      update.$inc = { googleCrawlerVisits: 1 };
    } else if (!userAgent.includes('bot') && !userAgent.includes('crawler')) {
      update.$inc = { views: 1 };
    }

    const updatedAnalytics = await PostAnalytics.findByIdAndUpdate(
      analytics._id,
      update,
      { new: true }
    );

    res.status(200).json(updatedAnalytics);
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({ error: 'Failed to track analytics' });
  }
}