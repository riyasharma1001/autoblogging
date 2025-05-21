// pages/api/uploadLocal.js
import nextConnect from "next-connect";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const handler = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

handler.use(upload.single('file'));

handler.post((req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file' });
  }

  const filePath = `/uploads/${req.file.filename}`;
  res.status(200).json({ 
    success: true, 
    url: filePath 
  });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;

// Example frontend code for image upload
const handleFeaturedImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append("file", file);
    
    const res = await fetch("/api/uploadLocal", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    setFeaturedImage(data.url);
  } catch (err) {
    console.error("Error uploading image:", err);
    // Handle error (show to user)
  }
};
