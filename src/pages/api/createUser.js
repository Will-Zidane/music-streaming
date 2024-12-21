const recombee = require('recombee-api-client');
const rqs = recombee.requests;

const client = new recombee.ApiClient('thewz-thewiz', 'ahi3VNWptGKy1nCAqhFyARS7fWS7WqhKUCWrXrzSu8A413LTETD9aiBLLCur8mfA', {
  region: 'us-west',
});

// Timeout value to be used for the requests
const TIMEOUT = 5000;  // Timeout in milliseconds

// Function to list users from Recombee
async function listUsersFromRecombee({ filter = '', count = 10, offset = 0, returnProperties = true, includedProperties = [] }) {
  try {
    // Define ListUsers request
    const listUsersRequest = new rqs.ListUsers({
      filter,
      count,
      offset,
      returnProperties,
      includedProperties
    });

    // Apply timeout to the request
    listUsersRequest.timeout = TIMEOUT;

    // Send the request
    const response = await client.send(listUsersRequest);

    // Log the response for debugging
    console.log('List of users:', response);

    return response;
  } catch (error) {
    console.error('Error retrieving users from Recombee:', error);
    throw error;  // Rethrow error to be handled at higher levels
  }
}

// Function to create 'default_user' in Recombee
async function createDefaultUser() {
  try {
    // Define AddUser request for default_user
    const createUserRequest = new rqs.AddUser('default_user');

    // Apply timeout to the request
    createUserRequest.timeout = TIMEOUT;

    // Send the request
    const response = await client.send(createUserRequest);

    // Log the response for debugging
    console.log('Default user created successfully:', response);

    return response;
  } catch (error) {
    console.error('Error creating default user:', error);
    throw error;  // Rethrow error to be handled at higher levels
  }
}

async function checkAndCreateDefaultUser() {
  try {
    // First, list users from Recombee and check if 'default_user' exists
    const users = await listUsersFromRecombee({
      filter: "id='default_user'", // Filter by user ID
      count: 1, // Get only 1 user
    });

    // If no users are found with this ID, create 'default_user'
    if (users.length === 0) {
      console.log('Default user does not exist, creating...');
      await createDefaultUser(); // Call function to create the user
    } else {
      console.log('Default user already exists:', users);
    }
  } catch (error) {
    console.error('Error checking or creating default user:', error);
  }
}

// Run the check-and-create process
checkAndCreateDefaultUser();

// Function to get recommendations for 'default_user'
async function getRecommendationsForDefaultUser(count) {
  try {
    const recommendationRequest = new rqs.RecommendItemsToUser('default_user', count, {
      scenario: 'top_listened_songs',  // Kịch bản phổ biến
      returnProperties: true,
      includedProperties: ['name', 'album', 'authors', 'coverArt', 'listenTime'],
    });

    const response = await client.send(recommendationRequest);
    console.log('Recommendations:', response);
    return response;
  } catch (error) {
    console.error('Error recommending items:', error);
  }
}

// Get 5 recommended items for 'default_user'
getRecommendationsForDefaultUser(5);
