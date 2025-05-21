import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method === "POST") {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const form = formidable({ uploadDir, keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: "File upload failed" });
      }
      const file = files.file;
      const filePath = "/uploads/" + path.basename(file.filepath);
      return res.status(200).json({ filePath });
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
