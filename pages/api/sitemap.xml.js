import { getSiteSettings } from '../../utils/settings';
import { connectToDatabase } from '../../utils/db';
import Post from '../../models/Post';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const settings = await getSiteSettings();
    const posts = await Post.find({ published: true })
      .select('title slug updatedAt createdAt')
      .lean();

    // Generate sitemap XML with proper checks
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${posts.map(post => {
        // Skip posts without slugs
        if (!post.slug) {
          console.warn(`Post "${post.title}" has no slug`);
          return '';
        }

        const lastMod = post.updatedAt || post.createdAt || new Date();
        return `
          <url>
            <loc>${process.env.NEXT_PUBLIC_SITE_URL}/post/${post.slug}</loc>
            <lastmod>${new Date(lastMod).toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
          </url>
        `;
      }).filter(Boolean).join('')}
      ${settings.sitemapConfig || ''}
    </urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Error generating sitemap' });
  }
}