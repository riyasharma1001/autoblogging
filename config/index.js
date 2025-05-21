const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myDatabase',
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
  ai: {
    apiKey: process.env.CHATGPT_API_KEY,
    endpoint: process.env.NEXT_PUBLIC_AI_API_ENDPOINT,
  },
};

export default config;