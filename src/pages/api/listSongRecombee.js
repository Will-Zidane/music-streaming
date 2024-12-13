// Import Recombee API client
const recombee = require('recombee-api-client');
const rqs = recombee.requests;

// Initialize Recombee client with your database ID and API token
const client = new recombee.ApiClient('thewz-thewiz', 'ahi3VNWptGKy1nCAqhFyARS7fWS7WqhKUCWrXrzSu8A413LTETD9aiBLLCur8mfA', {
  region: 'us-west',
});

// Function to list items from Recombee
function listItemsFromRecombee() {
  // Set optional parameters
  const filter = ``;
  const count = 10; // Number of items to retrieve
  const offset = 0; // Pagination offset
  const returnProperties = true; // Include item properties in the response
  const includedProperties = ['name', 'coverArt','listenTime', 'authors', 'album']; // Specify which properties to include
  // Send the ListItems request
  client.send(new rqs.ListItems({
    filter: filter,
    count: count,
    offset: offset,
    returnProperties: returnProperties,
    includedProperties: includedProperties,
  }))
    .then((response) => {
      // Handle the response
      console.log('Items retrieved successfully:', response);
    })
    .catch((error) => {
      // Handle the error
      console.error('Error retrieving items:', error);
    });
}

// Call the function to list items from Recombee
listItemsFromRecombee();