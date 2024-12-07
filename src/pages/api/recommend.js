import client from '../../utils/recombee';
import { RecommendItemsToUser } from 'recombee-api-client/lib/requests';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, count } = req.body;

    try {
      const recommendations = await client.send(
        new RecommendItemsToUser(userId, count, { scenario: 'homepage' })
      );
      res.status(200).json(recommendations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
