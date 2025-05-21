export async function generatePostContent(title, baseUrl) {
  try {
    // Step 1: Generate Article
    const generateRes = await fetch(`${baseUrl}/api/chatgpt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Write a detailed article about "${title}". Article must be SEO optimized, well structured, and around 1500 words.`
      })
    });

    if (!generateRes.ok) {
      throw new Error(`Failed to generate content: ${generateRes.status}`);
    }

    const generatedContent = await generateRes.json();

    if (!generatedContent.result) {
      throw new Error('No content received from AI generator');
    }

    // Clean up content before SEO optimization
    let cleanContent = generatedContent.result
      .replace(/```html/gi, "") // Remove ```html
      .replace(/```/g, "")      // Remove remaining ``` marks
      .replace(/^\s+|\s+$/g, "") // Trim whitespace
      .replace(/\n{3,}/g, "\n\n"); // Remove extra line breaks

    // Step 2: SEO Optimization
    const postData = {
      title,
      content: cleanContent,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const seoRes = await fetch(`${baseUrl}/api/seoOptimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: cleanContent,
        postData: postData
      })
    });

    if (!seoRes.ok) {
      const errorData = await seoRes.json();
      throw new Error(`SEO optimization failed: ${errorData.error || seoRes.status}`);
    }

    const seoData = await seoRes.json();

    if (!seoData.optimized) {
      throw new Error('No optimized content received from SEO service');
    }

    // Clean up SEO optimized content as well
    let finalContent = seoData.optimized
      .replace(/```html/gi, "")
      .replace(/```/g, "")
      .replace(/^\s+|\s+$/g, "")
      .replace(/\n{3,}/g, "\n\n");

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));

    return finalContent;

  } catch (error) {
    console.error('Error generating post:', error);
    throw error;
  }
}