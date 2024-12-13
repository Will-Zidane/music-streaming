// pages/api/recombee/addUserToRecombee.js
import { addUserToRecombee } from '@/utils/recombee';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Received request body:', JSON.stringify(req.body, null, 2));

      const { userData } = req.body;

      if (!userData) {
        console.error('No user data in request');
        return res.status(400).json({ error: 'User data is required' });
      }


      // Call the Recombee integration function
      await addUserToRecombee(userData);

      return res.status(200).json({
        message: 'User successfully added to Recombee',
        userId: userData.id
      });
    } catch (error) {
      console.error('Detailed Recombee API Route Error:', {
        message: error.message,
        stack: error.stack,
        details: error.response?.data
      });
      return res.status(500).json({
        error: 'Failed to add user to Recombee',
        details: error.message
      });
    }
  } else {
    // Handle non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
