// pages/api/bulkUpload.js
import nextConnect from "next-connect";
import multer from "multer";
import XLSX from "xlsx";
import { generatePostContent } from "../../utils/postGenerator";
import dbConnect from "../../utils/db";
import Post from "../../models/Post";

// Configure multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

const apiRoute = nextConnect();

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  try {
    await dbConnect();

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get base URL for internal API calls
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Read Excel workbook
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    let processedCount = 0;
    const totalPosts = jsonData.length;

    // Process each title one by one
    for (const row of jsonData) {
      const { Title: title } = row;

      try {
        // Generate and optimize content just like manual process
        const content = await generatePostContent(title, baseUrl);

        // Create post
        const post = new Post({
          title,
          content,
          published: true,
          createdAt: new Date(),
        });

        await post.save();
        processedCount++;
      } catch (error) {
        console.error(`Error processing post "${title}":`, error);
        continue;
      }

      // Add small delay between posts
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${processedCount} out of ${totalPosts} posts`,
      processedCount,
      totalPosts,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute;