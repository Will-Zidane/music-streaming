// Import Recombee API client
const recombee = require('recombee-api-client');

// Initialize the API client with your database ID and private token (use your private token for write operations)
const client = new recombee.ApiClient(
  'thewiz-thewiz',   // Replace with your actual database ID
  'MQpkIeqxwt4KQRLBweaB2k8Why4IyMSyg1M0G72VZxlGofc2gNPOohrjDtTtQ7RL', // Replace with your actual private token
  { region: 'us-west' }  // Specify the region of your Recombee database
);

// Define the item and user IDs
var itemId = 'product-270'; // Replace with the item ID you want to track or recommend for
var userId = 'user-1539'; // Replace with the user ID (the user for whom the recommendation is being generated)

// Send detail view to track user interaction with the item
client.send(new recombee.requests.AddDetailView(userId, itemId))  // Correct usage with .requests
  .then(() => {
    console.log(`Detail view recorded for ${itemId} by ${userId}`);
  })
  .catch(err => {
    console.error('Error recording detail view:', err);
  });

// Request recommended items based on a specific item
client.send(new recombee.requests.RecommendItemsToItem(itemId, userId, 3, {
  returnProperties: true,  // Returns item properties (like title, description)
  includedProperties: ['title', 'description', 'link', 'image_link', 'price'],  // Specify the properties you want in the recommendations
  filter: "'title' != null AND 'availability' == \"in stock\"", // Only recommend items that are in stock and have a title
  scenario: 'related_items'  // Optional: You can use a specific scenario like 'related_items' to indicate the recommendation context
}))
  .then(response => {
    // Log recommended items
    console.log('Recommendations:', response.recomms);
  })
  .catch(err => {
    console.log('Could not load recomms:', err);
  });
