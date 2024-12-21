const recombee = require('recombee-api-client');
const rqs = recombee.requests;

// Initialize Recombee client
const client = new recombee.ApiClient('thewz-thewiz', 'ahi3VNWptGKy1nCAqhFyARS7fWS7WqhKUCWrXrzSu8A413LTETD9aiBLLCur8mfA', {
  region: 'us-west',
});

const TIMEOUT = 10000;  // Timeout in milliseconds

const itemId = '2';  // The current item (song) that the user is viewing
const targetUserId = '27';  // The user for whom the recommendations are made
const count = 3;  // Number of recommendations

// Creating the request for recommending related items based on the current item (itemId)
const recommendRequest = new rqs.RecommendItemsToItem(itemId, targetUserId, count, {
  scenario: 'next-songs',  // Ensure this scenario exists in your Recombee setup
  returnProperties: true,  // Return the properties of the recommended items
  includedProperties: ['name', 'album', 'authors', 'coverArt', 'listenTime'],  // Properties you want to include
  filter: `'authors' == context_item["authors"]`,  // Filter by the same authors as the current item
  booster: `if 'listenTime' >= 100 then 1 else 0`,  // Corrected ReQL conditional expression  // Additional optional parameters (if needed):
  // logic: 'some_logic',
  // minRelevance: 'some_value',
  // rotationRate: some_number,
  // rotationTime: some_number
});

// Setting timeout for the request
recommendRequest.timeout = TIMEOUT;

client.send(recommendRequest)
  .then((response) => {
    if (response.recomms && response.recomms.length > 0) {
      console.log('Recommended items:');
      response.recomms.forEach(item => {
        const itemDetails = item.values;
        console.log(`Item ID: ${item.id}`);
        if (itemDetails) {
          console.log(`  Name: ${itemDetails.name}`);
          console.log(`  Album: ${itemDetails.album}`);
          console.log(`  Authors: ${itemDetails.authors}`);
          console.log(`  Cover Art: ${itemDetails.coverArt}`);
          console.log(`  Listen Time: ${itemDetails.listenTime}`);
        }
      });
    } else {
      console.log('No recommendations available.');
    }
  })
  .catch((error) => {
    console.error('Error getting recommendations:', error);
  });
