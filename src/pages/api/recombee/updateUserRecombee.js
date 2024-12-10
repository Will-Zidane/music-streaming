// api/recombee/updateUserRecombee.js
import { setUserValues } from '@/utils/recombee'; // Import hàm setUserValues thay vì updateUserValues

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, listenTime } = req.body;

      // Validate input
      if (!userId || typeof listenTime !== 'number') {
        return res.status(400).json({
          error: "'userId' and 'listenTime' are required and listenTime must be a number"
        });
      }

      // Check if the user exists in Recombee
      const userExists = await client
        .send(new rqs.GetUserValues(userId.toString(), ['totalListenTime']))
        .catch(() => null);

      if (!userExists) {
        // If user does not exist, create the user in Recombee
        console.log(`User with ID ${userId} does not exist. Creating user.`);
        await client.send(new rqs.AddUser(userId.toString()));
      }

      // Use setUserValues to update the user's total listen time
      await setUserValues(userId, { totalListenTime: listenTime }, true);

      return res.status(200).json({
        message: 'User total listen time successfully updated in Recombee',
        userId,
        totalListenTime: listenTime,
      });
    } catch (error) {
      console.error('Error updating user total listen time in Recombee:', error);
      return res.status(500).json({
        error: 'Failed to update user total listen time in Recombee',
        details: error.message,
      });
    }
  } else {
    // Handle non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
