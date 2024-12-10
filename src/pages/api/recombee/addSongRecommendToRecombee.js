// api/recombee/addSongRecommendToRecombee.js

import { addDetailView } from '@/utils/recombee';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Received request body:', JSON.stringify(req.body, null, 2));

      const { userId, itemId, timestamp, duration, cascadeCreate, recommId } = req.body;

      if (!userId || !itemId) {
        console.error('Missing required fields: userId and itemId');
        return res.status(400).json({ error: 'userId and itemId are required' });
      }

      // Call the Recombee integration function to log the detail view
      await addDetailView(userId, itemId, { timestamp, duration, cascadeCreate, recommId });

      return res.status(200).json({
        message: 'Detail view successfully added to Recombee',
        userId,
        itemId
      });
    } catch (error) {
      console.error('Detailed Recombee API Route Error:', {
        message: error.message,
        stack: error.stack,
        details: error.response?.data
      });
      return res.status(500).json({
        error: 'Failed to add song recommendation to Recombee',
        details: error.message
      });
    }
  } else {
    // Handle non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
