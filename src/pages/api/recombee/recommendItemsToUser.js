// pages/api/recombee/recommendItemsToUser.js
import { recommendItemsToUser } from '@/utils/recombee';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Received request body:', JSON.stringify(req.body, null, 2));

      const { userId, count, options } = req.body;

      // Validate userId and count
      if (!userId || !count) {
        console.error('Missing userId or count');
        return res.status(400).json({ error: 'userId and count are required' });
      }

      // Validate count (ensure it's a number)
      if (isNaN(count) || count <= 0) {
        console.error('Invalid count value');
        return res.status(400).json({ error: 'count must be a positive number' });
      }

      // Call the Recombee function to recommend items
      const recommendations = await recommendItemsToUser(userId, count, options);

      return res.status(200).json({
        message: 'Items recommended successfully',
        recommendations,
      });
    } catch (error) {
      console.error('Detailed Recombee API Route Error:', {
        message: error.message,
        stack: error.stack,
        details: error.response?.data,
      });
      return res.status(500).json({
        error: 'Failed to recommend items to user',
        details: error.message,
      });
    }
  } else {
    // Handle non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
