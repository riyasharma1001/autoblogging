// pages/api/rss.js
import { connectToDB } from "../../utils/db";
import Post from "../../models/Post";

export default async function handler(req, res) {
  await connectToDB();

  // Replace this with your site's URL (or use an environment variable)
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  // Fetch published posts, sorted by newest first
  let posts = await Post.find({ published: true }).sort({ createdAt: -1 }).lean();

  // Convert MongoDB _id and Date fields to strings
  posts = posts.map((post) => ({
    ...post,
    _id: post._id.toString(),
    createdAt: post.createdAt ? post.createdAt.toISOString() : "",
  }));

  // Build RSS items. Here we use the first 200 characters of the content as the description.
  // Adjust this as needed (for example, extract a proper excerpt).
  const rssItems = posts
    .map((post) => {
      const postUrl = `${siteUrl}/posts/${post._id}`;
      // Ensure content is a string (if using Editor.js, you might need a different approach)
      const description = post.content
        ? post.content.substring(0, 200) + "..."
        : "";
      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${postUrl}</link>
          <guid>${postUrl}</guid>
          <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
          <description><![CDATA[${description}]]></description>
        </item>
      `;
    })
    .join("");

  // Build the full RSS feed XML
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>Your Blog Title</title>
        <link>${siteUrl}</link>
        <description>Your blog description goes here.</description>
        <language>en-us</language>
        ${rssItems}
      </channel>
    </rss>`;

  res.setHeader("Content-Type", "application/rss+xml");
  res.status(200).send(rss);
}
