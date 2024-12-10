// pages/api/recommendations.js
import { ApiClient, AddDetailView, RecommendItemsToItem } from 'recombee-api-client';

const client = new ApiClient(
  'thewiz-thewiz',
  'MQpkIeqxwt4KQRLBweaB2k8Why4IyMSyg1M0G72VZxlGofc2gNPOohrjDtTtQ7RL',
  { region: 'us-west' }
);

export default async function handler(req, res) {
  const { userId, itemId } = req.query;


  try {
    // Send detail view
    await client.send(new AddDetailView(userId, itemId));

    // Get recommendations
    const response = await client.send(new RecommendItemsToItem(itemId, userId, 3, {
      returnProperties: true,
      includedProperties: ['title', 'description', 'link', 'image_link', 'price'],
      filter: "'title' != null AND 'availability' == \"in stock\"",
      scenario: 'related_items'
    }));

    console.log('API route called:', userId, itemId);


    // Respond with recommendations in JSON format
    res.status(200).json(response.recomms);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations', message: error.message });
  }
}
