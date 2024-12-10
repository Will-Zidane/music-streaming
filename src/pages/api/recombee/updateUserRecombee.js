import { setUserValuesToRecombee } from '@/utils/recombee'; // Import the function to update user values in Recombee

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Received request body:', JSON.stringify(req.body, null, 2));

      const { userId, listenTime } = req.body;

      // Validate that userId and listenTime are provided and listenTime is a number
      if (!userId || typeof listenTime !== 'number') {
        console.error('Invalid request body: userId and listenTime are required');
        return res.status(400).json({ error: "'userId' and 'listenTime' are required and listenTime must be a number" });
      }

      // Retrieve the current user's total listen time from Recombee
      const userProperties = await client.send(new rqs.GetUserValues(userId.toString(), ['totalListenTime']));

      // Get current totalListenTime, default to 0 if it doesn't exist
      const currentTotalListenTime = Number(userProperties.totalListenTime || 0);
      const updatedTotalListenTime = currentTotalListenTime + listenTime;

      console.log('Updating total listen time for user:', userId);

      // Call the function to update the total listen time for the user in Recombee
      await setUserValuesToRecombee(userId, { totalListenTime: updatedTotalListenTime });

      return res.status(200).json({
        message: 'User total listen time successfully updated in Recombee',
        userId,
        totalListenTime: updatedTotalListenTime
      });
    } catch (error) {
      console.error('Detailed Recombee API Route Error:', {
        message: error.message,
        stack: error.stack,
        details: error.response?.data || 'No additional error details'
      });
      return res.status(500).json({
        error: 'Failed to update total listen time in Recombee',
        details: error.message
      });
    }
  } else {
    // Handle non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
