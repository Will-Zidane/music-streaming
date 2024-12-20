// pages/api/recombee/addUserItemInteractions.js
import { addDetailView } from '@/utils/recombee';




export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Received request body:', JSON.stringify(req.body, null, 2));

      const { userId, itemId, options } = req.body;

      // Validate required fields
      if (!userId || !itemId) {
        console.error('Missing required fields: userId or itemId');
        return res.status(400).json({ error: 'userId and itemId are required' });
      }

      // Call the Recombee integration function
      await addDetailView(userId, itemId, options);

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
        error: 'Failed to add detail view to Recombee',
        details: error.message
      });
    }
  } else {
    // Handle non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
