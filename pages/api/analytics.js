import { connectToDatabase } from '../../utils/db';
import PostAnalytics from '../../models/PostAnalytics';
import Post from '../../models/Post';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // First ensure analytics exist for all posts
    const posts = await Post.find({});
    for (const post of posts) {
      const exists = await PostAnalytics.findOne({ postId: post._id });
      if (!exists) {
        await PostAnalytics.create({
          postId: post._id,
          postTitle: post.title,
          views: 0,
          googleCrawlerVisits: 0,
          googlebotVisits: 0,
          adsenseBotVisits: 0
        });
      }
    }

    // Fetch analytics with post data
    const analytics = await PostAnalytics.find({})
      .sort({ views: -1 });

    const formattedAnalytics = analytics.map(item => ({
      _id: item._id.toString(),
      postId: item.postId.toString(),
      postTitle: item.postTitle,
      views: item.views,
      googleCrawlerVisits: item.googleCrawlerVisits,
      googlebotVisits: item.googlebotVisits,
      adsenseBotVisits: item.adsenseBotVisits,
      lastUpdated: item.lastUpdated
    }));

    res.status(200).json(formattedAnalytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}