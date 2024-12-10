// api/recombee/updateListenTime.js
import { setItemValues } from '@/utils/recombee';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Received request body:', JSON.stringify(req.body, null, 2));

      const { itemId, listenTime } = req.body;

      if (!itemId || typeof listenTime !== 'number') {
        console.error('Invalid request body: itemId and listenTime are required');
        return res.status(400).json({ error: "'itemId' and 'listenTime' are required and listenTime must be a number" });
      }

      // Call the Recombee integration function to update listenTime
      await setItemValues(itemId, { listenTime });

      return res.status(200).json({
        message: 'Listen time successfully updated in Recombee',
        itemId,
        listenTime
      });
    } catch (error) {
      console.error('Detailed Recombee API Route Error:', {
        message: error.message,
        stack: error.stack,
        details: error.response?.data || 'No additional error details'
      });
      return res.status(500).json({
        error: 'Failed to update listen time in Recombee',
        details: error.message
      });
    }
  } else {
    // Handle non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
