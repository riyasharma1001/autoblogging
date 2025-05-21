/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    CHATGPT_API_KEY: process.env.CHATGPT_API_KEY,
    NEXT_PUBLIC_AI_API_ENDPOINT: process.env.NEXT_PUBLIC_AI_API_ENDPOINT,
  }
}

module.exports = nextConfig
