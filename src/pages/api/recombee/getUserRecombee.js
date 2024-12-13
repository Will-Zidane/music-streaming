import { getUserFromRecombee } from '@/utils/recombee';
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, userData } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const updatedUser = await getUserFromRecombee(userId, userData);

      return res.status(200).json({
        message: 'User data successfully fetched and updated in Recombee',
        userId,
        updatedUser
      });
    } catch (error) {
      console.error('Error retrieving or setting user data in Recombee:', error);
      return res.status(500).json({ error: 'Failed to retrieve or set user data in Recombee' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
