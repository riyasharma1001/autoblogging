// pages/api/uploadS3.js
import nextConnect from "next-connect";
import multer from "multer";
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const upload = multer({ storage: multer.memoryStorage() });

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error("Error in uploadS3:", error);
    res.status(500).json({ error: "Internal server error" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  try {
    const fileContent = req.file.buffer;
    const fileName = `${Date.now()}-${req.file.originalname}`;

    // We do NOT set ACL because the bucket has object ownership enforced
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ContentType: req.file.mimetype,
    };

    const data = await s3.upload(params).promise();

    // data.Location is the default S3 URL (like https://<bucket>.s3.amazonaws.com/...)
    let publicUrl = data.Location;

    // If we have an access point alias, replace the hostname with that domain
    if (process.env.S3_ACCESS_POINT_ALIAS) {
      const urlObj = new URL(publicUrl);

      // Build the domain: <alias>.s3-accesspoint.<region>.amazonaws.com
      urlObj.hostname = `${process.env.S3_ACCESS_POINT_ALIAS}.s3-accesspoint.${process.env.AWS_REGION}.amazonaws.com`;

      publicUrl = urlObj.toString();
    }

    return res.status(200).json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("S3 upload error:", err);
    return res.status(500).json({ error: "Failed to upload to S3" });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute;
