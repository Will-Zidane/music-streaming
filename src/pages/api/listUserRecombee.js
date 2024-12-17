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

// Example: Get 5 users with specific properties
async function getUsers() {
  try {
    const users = await listUsersFromRecombee({
      count: 5,  // Get 5 users
      includedProperties: ['username', 'email']  // Get only 'username' and 'email' properties
    });

    console.log('Retrieved Users:', users);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
getUsers();
