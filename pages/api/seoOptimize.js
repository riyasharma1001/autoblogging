// pages/api/seoOptimize.js
import { fixSeoTags } from '../../utils/seoHelper';

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { html, postData } = req.body;
    if (!html || typeof html !== "string" || !postData) {
      return res.status(400).json({ error: "Missing or invalid html property or postData" });
    }
  
    try {
      // 1) Construct a base URL from the request headers
      const protocol = req.headers["x-forwarded-proto"] || "http";
      const host = req.headers.host;
      const baseUrl = `${protocol}://${host}`;
  
      // 2) Build a ChatGPT prompt instructing for SEO optimization with a *specific* YouTube video embed:
      //
      // NOTE: We are explicitly providing a known BMW M5 video ID (Zp9jszTx6DA).
      //       You can replace this ID with any *valid*, *playable* YouTube video ID you prefer.
      const seoPrompt = `
        You are an SEO expert. Optimize the following HTML content for best SEO practices:
        - Add or enhance meta tags (title, description, keywords, etc.)
        - Insert relevant JSON-LD schema for an article or blog post
        - Add open graph tags
        - Ensure any existing tags are improved for SEO
        - Add external source linking on some words to credible sources
        - At the end of the content, embed this specific, working YouTube video using an iframe:
          <iframe width="560" height="315"
                  src="https://www.youtube.com/embed/Zp9jszTx6DA"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
          </iframe>
        - Return ONLY the optimized HTML, with no extra commentary.
  
        Here is the HTML to optimize:
        ${html}
      `;
  
      // 3) Call your existing /api/chatgpt route with the SEO prompt
      const chatRes = await fetch(`${baseUrl}/api/chatgpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: seoPrompt }),
      });
  
      if (!chatRes.ok) {
        const errorText = await chatRes.text();
        throw new Error(`ChatGPT request failed: ${chatRes.status} - ${errorText}`);
      }
  
      const data = await chatRes.json();
      const optimizedHTML = data.result;
      if (!optimizedHTML) {
        throw new Error("No optimized HTML found in ChatGPT response.");
      }
  
      // Then fix SEO tags
      const finalHtml = await fixSeoTags(optimizedHTML, postData);
  
      // 4) Return the optimized HTML
      return res.status(200).json({ optimized: finalHtml });
    } catch (err) {
      console.error("Error in seoOptimize.js:", err);
      return res.status(500).json({ error: err.message || "Something went wrong" });
    }
  }
