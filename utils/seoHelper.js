import { getSiteSettings } from './settings';

export async function fixSeoTags(html, post) {
  try {
    const settings = await getSiteSettings();
    const siteUrl = settings.siteUrl.replace(/\/$/, ''); // Remove trailing slash
    
    // Create proper URLs
    const postUrl = `${siteUrl}/post/${post.slug}`;
    const featuredImageUrl = post.featuredImage ? 
      `${siteUrl}${post.featuredImage}` : 
      `${siteUrl}/default-featured-image.jpg`;
    const logoUrl = settings.logoUrl ? 
      `${siteUrl}${settings.logoUrl}` : 
      `${siteUrl}/logo.png`;

    // Fix meta tags
    let updatedHtml = html
      .replace(
        /<meta property="og:url" content="[^"]*"/g,
        `<meta property="og:url" content="${postUrl}"`
      )
      .replace(
        /<meta property="og:image" content="[^"]*"/g,
        `<meta property="og:image" content="${featuredImageUrl}"`
      );

    // Fix JSON-LD
    const jsonLdRegex = /<script type="application\/ld\+json">\s*{[\s\S]*?}<\/script>/;
    const jsonLdMatch = updatedHtml.match(jsonLdRegex);
    
    if (jsonLdMatch) {
      let jsonLd = JSON.parse(jsonLdMatch[0].replace(/<script type="application\/ld\+json">\s*|\s*<\/script>/g, ''));
      
      // Update JSON-LD data
      jsonLd = {
        ...jsonLd,
        image: featuredImageUrl,
        url: postUrl,
        datePublished: post.createdAt.toISOString().split('T')[0],
        dateModified: post.updatedAt.toISOString().split('T')[0],
        publisher: {
          "@type": "Organization",
          "name": settings.organizationName || settings.siteName,
          "logo": {
            "@type": "ImageObject",
            "url": logoUrl
          }
        }
      };

      // Replace old JSON-LD with updated version
      updatedHtml = updatedHtml.replace(
        jsonLdRegex,
        `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`
      );
    }

    return updatedHtml;
  } catch (error) {
    console.error('Error fixing SEO tags:', error);
    return html; // Return original HTML if something goes wrong
  }
}