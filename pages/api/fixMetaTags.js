import { connectToDatabase } from '../../utils/db';
import Settings from '../../models/Settings';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { html, postData } = req.body;
    if (!html || !postData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get settings for domain and other configurations
    const settings = await Settings.findOne({}) || {};
    const domain = settings.siteUrl || 'http://localhost:3000';

    // Fix meta tags
    let fixedHtml = html;

    // Fix og:url
    const postUrl = `${domain}/post/${postData.slug}`;
    fixedHtml = fixedHtml.replace(
      /<meta property="og:url" content="[^"]*"/g,
      `<meta property="og:url" content="${postUrl}"`
    );

    // Fix og:image
    const imageUrl = postData.featuredImage 
      ? `${domain}${postData.featuredImage}`
      : `${domain}/default-image.jpg`;
    fixedHtml = fixedHtml.replace(
      /<meta property="og:image" content="[^"]*"/g,
      `<meta property="og:image" content="${imageUrl}"`
    );

    // Fix canonical URL
    fixedHtml = fixedHtml.replace(
      /<link rel="canonical" href="[^"]*"/g,
      `<link rel="canonical" href="${postUrl}"`
    );

    // Fix JSON-LD
    const jsonLdRegex = /<script type="application\/ld\+json">\s*{[\s\S]*?}<\/script>/;
    const jsonLdMatch = fixedHtml.match(jsonLdRegex);
    
    if (jsonLdMatch) {
      let jsonLd = JSON.parse(jsonLdMatch[0].replace(
        /<script type="application\/ld\+json">\s*|\s*<\/script>/g, 
        ''
      ));

      // Update JSON-LD data
      jsonLd = {
        ...jsonLd,
        url: postUrl,
        image: imageUrl,
        dateModified: new Date().toISOString(),
        publisher: {
          "@type": "Organization",
          "name": settings.organizationName || settings.siteName || "My CMS",
          "logo": {
            "@type": "ImageObject",
            "url": `${domain}${settings.logoUrl || '/logo.png'}`
          }
        }
      };

      // Replace old JSON-LD with updated version
      fixedHtml = fixedHtml.replace(
        jsonLdRegex,
        `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`
      );
    }

    return res.status(200).json({ fixedHtml });
  } catch (error) {
    console.error('Error fixing meta tags:', error);
    return res.status(500).json({ error: error.message });
  }
}