import { getSiteSettings } from '../../utils/settings';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const settings = await getSiteSettings();
    const defaultRobots = `User-agent: *
Allow: /
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/api/sitemap.xml`;

    const robotsTxt = settings.robotsTxt || defaultRobots;

    res.setHeader('Content-Type', 'text/plain');
    res.write(robotsTxt);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Error generating robots.txt' });
  }
}