import { getSiteSettings } from '../../utils/settings';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const settings = await getSiteSettings();
    const adsTxt = settings.adsTxt || '';

    res.setHeader('Content-Type', 'text/plain');
    res.write(adsTxt);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Error generating ads.txt' });
  }
}