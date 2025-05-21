// scripts/cron.js
import cron from 'node-cron';
import dbConnect from '../utils/db';
import ScheduledPost from '../models/ScheduledPost';
import Post from '../models/Post'; // Your main Post model
import fetch from 'node-fetch';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

(async function() {
  await dbConnect();

  cron.schedule('* * * * *', async () => {
    console.log('Checking for scheduled posts...');

    // Get current time in IST
    const nowIST = dayjs().tz('Asia/Kolkata');

    // Fetch all pending scheduled posts
    const pendingPosts = await ScheduledPost.find({ status: 'pending' });
    for (const scheduled of pendingPosts) {
      // Combine the date and time columns to form a full date-time string.
      // Expecting formats like "YYYY-MM-DD" for date and "HH:mm" for time.
      const dateTimeStr = `${scheduled.scheduledDate} ${scheduled.scheduledTime}`;
      const scheduledIST = dayjs.tz(dateTimeStr, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');

      if (nowIST.isSameOrAfter(scheduledIST)) {
        try {
          // Generate article via your /api/chatgpt endpoint
          const generateRes = await fetch('http://localhost:3000/api/chatgpt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Write a 1500-word article about "${scheduled.keyword}" with SEO meta tags.`
            })
          });
          const generateData = await generateRes.json();
          let content = generateData.result;

          // Filter the generated content
          let filterRes = await fetch('http://localhost:3000/api/filterResponse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: content })
          });
          let filterData = await filterRes.json();
          content = filterData.filtered;

          // Perform SEO optimization
          let seoRes = await fetch('http://localhost:3000/api/seoOptimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: content })
          });
          let seoData = await seoRes.json();
          let optimizedHTML = seoData.optimized;

          // Filter the optimized content again if needed
          filterRes = await fetch('http://localhost:3000/api/filterResponse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: optimizedHTML })
          });
          filterData = await filterRes.json();
          optimizedHTML = filterData.filtered;

          // Save the final post
          const newPost = await Post.create({
            title: scheduled.keyword,
            content: optimizedHTML,
            published: true
          });

          // Update the scheduled post status
          scheduled.status = 'published';
          scheduled.publishedPostId = newPost._id;
          await scheduled.save();

          console.log(`Published post for "${scheduled.keyword}" at ${nowIST.format()}`);
        } catch (err) {
          console.error(`Failed to publish scheduled post for "${scheduled.keyword}":`, err);
        }
      }
    }
  });
})();
