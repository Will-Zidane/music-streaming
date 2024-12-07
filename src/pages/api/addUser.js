import client from '@/utils/recombee';
import { AddUser } from 'recombee-api-client/lib/requests';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId } = req.body;

    try {
      await client.send(new AddUser(userId));
      res.status(200).json({ message: 'User added successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
