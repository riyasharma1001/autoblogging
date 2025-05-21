// pages/api/auth/logout.js
import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Clear the token cookie by setting its expiry in the past.
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: -1,
      sameSite: "strict",
      path: "/",
    })
  );
  return res.status(200).json({ success: true, message: "Logged out" });
}
