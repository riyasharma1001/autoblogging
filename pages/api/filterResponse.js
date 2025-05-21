// pages/api/filterResponse.js

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { html } = req.body;
  
    if (!html || typeof html !== "string") {
      return res.status(400).json({ error: "Missing or invalid html property" });
    }
  
    let filtered = html;
  
    // Remove the DOCTYPE declaration.
    filtered = filtered.replace(/<!DOCTYPE[^>]*>/i, "");
    // Remove the opening <html ...> tag.
    filtered = filtered.replace(/<html[^>]*>/i, "");
    // Remove the closing </html> tag.
    filtered = filtered.replace(/<\/html>/i, "");
    // Remove any <link rel="stylesheet" ...> tags.
    filtered = filtered.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, "");
    // Optionally, change the meta author from "Your Name" to "Gagan Chaudhary"
    filtered = filtered.replace(
      /<meta\s+name=["']author["']\s+content=["']Your Name["'][^>]*>/i,
      '<meta name="author" content="Gagan Chaudhary">'
    );
  
    // Remove markdown code fences for HTML (```html and ```)
    filtered = filtered.replace(/```html/gi, "");
    filtered = filtered.replace(/```/g, "");
  
    // Trim extra whitespace from the beginning and end.
    filtered = filtered.trim();
  
    return res.status(200).json({ filtered });
  }
  