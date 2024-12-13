// api/recombee/updateUserRecombee.js
import { setUserValues } from '@/utils/recombee';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, username, email } = req.body;

      // Validate input data
      if (!userId || !username || !email) {
        return res.status(400).json({ error: 'UserId, username, and email are required' });
      }

      // Call the function to update the user in Recombee
      await setUserValues(userId, username, email);

      return res.status(200).json({
        message: 'User successfully updated in Recombee',
        userId,
      });
    } catch (error) {
      console.error('Error processing user request:', error);
      return res.status(500).json({
        error: 'Failed to process user data',
        details: error.message,
      });
    }
  } else {
    // Handle non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
