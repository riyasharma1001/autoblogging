import dbConnect from '../../utils/db';
import Settings from '../../models/Settings';

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      // Find settings or create default ones if none exist
      let settings = await Settings.findOne({});
      
      if (!settings) {
        settings = await Settings.create({
          siteName: 'My CMS',
          siteUrl: 'http://localhost:3000',
          authorName: 'Gagan Chaudhary'
        });
      }

      return res.status(200).json(settings);
    }

    if (req.method === 'POST') {
      const updates = req.body;

      // Find and update, or create if doesn't exist
      const settings = await Settings.findOneAndUpdate(
        {}, // empty filter to match first document
        { $set: updates }, // use $set to only update provided fields
        { 
          new: true, // return updated doc
          upsert: true, // create if doesn't exist
          runValidators: true, // run schema validations
          setDefaultsOnInsert: true // apply schema defaults if upsert
        }
      );

      return res.status(200).json(settings);
    }

    return res.status(405).json({ error: `Method ${req.method} not allowed` });

  } catch (error) {
    console.error('Settings API error:', error);
    return res.status(500).json({ error: error.message });
  }
}