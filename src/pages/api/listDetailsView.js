var recombee = require('recombee-api-client');
var rqs = recombee.requests;

// Initialize Recombee client
const client = new recombee.ApiClient('thewz-thewiz', 'ahi3VNWptGKy1nCAqhFyARS7fWS7WqhKUCWrXrzSu8A413LTETD9aiBLLCur8mfA', {
  region: 'us-west',
});


// Function to list user detail views
function listUserDetailViews(userId) {
  if (!userId) {
    console.error('User ID is required to list detail views.');
    return;
  }

  client.send(new rqs.ListUserDetailViews(userId.toString()))
    .then((response) => {
      console.log(`Detail views for user ${userId} retrieved successfully:`);
      console.log(response);
    })
    .catch((error) => {
      console.error(`Error retrieving detail views for user ${userId}:`);
      console.error(error.response?.data || error.message);
    });
}

// Example usage
listUserDetailViews('1'); // Replace '1' with the actual userId
