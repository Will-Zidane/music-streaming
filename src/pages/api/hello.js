const recombee = require('recombee-api-client');
const rqs = recombee.requests;

// Client initialization
const client = new recombee.ApiClient('thewz-thewiz', 'ahi3VNWptGKy1nCAqhFyARS7fWS7WqhKUCWrXrzSu8A413LTETD9aiBLLCur8mfA', {
  region: 'us-west',
});

// Timeout value to be used for the requests
const TIMEOUT = 5000;  // Timeout in milliseconds

// Function to get or set user properties from Recombee with timeout
async function getUserFromRecombee(userId, userData) {
  try {
    // Validate input
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Define the GetUserValues request
    const getUserValuesRequest = new rqs.GetUserValues(
      userId.toString(),
      ['username', 'email', 'totalListenTime']
    );

    // Apply timeout to the request object
    getUserValuesRequest.timeout = TIMEOUT;

    // Send the request with timeout
    const userProperties = await client.send(getUserValuesRequest);
    console.log('Retrieved User Properties BEFORE setting:', userProperties);

    // Define the SetUserValues request
    const setUserValuesRequest = new rqs.SetUserValues(
      userId.toString(),
      {
        username: userData?.username || userProperties.username || 'unknown',
        email: userData?.email || userProperties.email || 'unknown@example.com',
        totalListenTime: userData?.totalListenTime ||
          (userProperties.totalListenTime || 0)
      },
      {
        cascadeCreate: true  // Automatically create user if not exists
      }
    );

    // Apply timeout to the SetUserValues request object
    setUserValuesRequest.timeout = TIMEOUT;

    // Send the SetUserValues request with timeout
    await client.send(setUserValuesRequest);

    // Retrieve updated user properties with timeout
    const updatedUserProperties = await client.send(new rqs.GetUserValues(
      userId.toString(),
      ['username', 'email', 'totalListenTime']
    ));

    console.log('Retrieved User Properties AFTER setting:', updatedUserProperties);

    return updatedUserProperties;
  } catch (error) {
    console.error('Error retrieving or setting user from Recombee:', error);
    throw error;
  }
}

// Example usage
async function exampleUserFlow() {
  try {
    // Example: Get or create a user
    const userId = '1';
    const userData = {
      username: 'thewiz',
      email: 'danpham566@gmail.com',
      totalListenTime: 0
    };

    const userResult = await getUserFromRecombee(userId, userData);
    console.log('Final User Result:', userResult);
  } catch (error) {
    console.error('Error in user flow:', error);
  }
}

exampleUserFlow();

module.exports = {
  getUserFromRecombee,
};
