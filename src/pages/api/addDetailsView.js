// Import Recombee API client
const recombee = require('recombee-api-client');
const rqs = recombee.requests;

// Initialize Recombee client
const client = new recombee.ApiClient('thewz-thewiz', 'ahi3VNWptGKy1nCAqhFyARS7fWS7WqhKUCWrXrzSu8A413LTETD9aiBLLCur8mfA', {
  region: 'us-west',
});

function logUserInteraction(userId, itemId, options = {}) {
  // Validate input
  if (!userId || !itemId) {
    console.error('Invalid userId or itemId. Both are required to log interaction.');
    return;
  }

  // Prepare the AddDetailView request
  const detailViewRequest = new rqs.AddDetailView(userId.toString(), itemId.toString(), {
    timestamp: options.timestamp || Date.now(),
    duration: options.duration || null,
    cascadeCreate: options.cascadeCreate || true,
    recommId: options.recommId || null,
  });

  // Set a longer timeout (e.g., 5000 ms or 5 seconds)
  detailViewRequest.timeout = 5000;

  client.send(detailViewRequest)
    .then(response => {
      console.log(`Logged interaction: User ${userId}, Item ${itemId}`, response);
    })
    .catch(error => {
      console.error('Error logging interaction:', error.response?.data || error.message);
    });
}

// Example usage with a 5-second timeout
logUserInteraction(
  '1', // User ID
  '11', // Item ID
  {
    timestamp: new Date().toISOString(), // Optional timestamp
    duration: 150,                       // Optional duration in seconds
    cascadeCreate: true                  // Automatically create user/item if missing
  }
);


