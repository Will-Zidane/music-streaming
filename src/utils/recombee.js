const recombee = require('recombee-api-client');
const rqs = recombee.requests;

// Client initialization
const client = new recombee.ApiClient('thewz-thewiz', 'ahi3VNWptGKy1nCAqhFyARS7fWS7WqhKUCWrXrzSu8A413LTETD9aiBLLCur8mfA', {
  region: 'us-west',
});

// Timeout value to be used for the requests
const TIMEOUT = 5000;  // Timeout in milliseconds

// Function to define properties for users in Recombee
async function defineUserProperties() {
  try {
    console.log('Defining user properties...');

    // Define the properties for the users with explicit types and defaults
    await client.send(new rqs.AddUserProperty('username', 'string', { defaultValue: '' }));
    await client.send(new rqs.AddUserProperty('email', 'string', { defaultValue: '' }));
    await client.send(new rqs.AddUserProperty('totalListenTime', 'int', { defaultValue: 0 }));

    console.log('User properties defined successfully.');
  } catch (error) {
    console.error('Error defining user properties:', error);
    console.error('Detailed error:', error.response?.data || error.message);
    throw error;
  }
}

// Function to get user properties from Recombee
async function getUserFromRecombee(userId, userData) {
  try {

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
    setUserValuesRequest.timeout = 1000;

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

// Function to add a user to Recombee
const addUserToRecombee = async (userData, playlists = []) => {
  try {
    console.log('Raw userData:', userData);
    await defineUserProperties();

    if (!userData) {
      console.error('No user data provided');
      return;
    }

    const safeUserData = {
      id: userData.id || 'unknown',
      username: userData.username || 'unknown',
      email: userData.email || 'unknown@example.com'
    };

    // Define the AddUser request
    const addUserRequest = new rqs.AddUser(safeUserData.id.toString());
    // Apply timeout to the AddUser request object
    addUserRequest.timeout = TIMEOUT;

    // Send the request with timeout
    await client.send(addUserRequest);

    const totalListenTime = playlists.reduce((total, playlist) => {
      return total + (playlist.songs || []).reduce((songTotal, song) => {
        return songTotal + (song?.listenTime || 0);
      }, 0);
    }, 0);

    console.log('Setting user values:', { username: safeUserData.username, email: safeUserData.email, totalListenTime });

    // Define the SetUserValues request
    const setUserValuesRequest = new rqs.SetUserValues(
      safeUserData.id.toString(),
      {
        username: safeUserData.username,
        email: safeUserData.email,
        totalListenTime: totalListenTime
      }
    );
    // Apply timeout to the SetUserValues request object
    setUserValuesRequest.timeout = TIMEOUT;

    // Send the SetUserValues request with timeout
    await client.send(setUserValuesRequest);

    // Retrieve the user with updated values
    await getUserFromRecombee(safeUserData.id, safeUserData);
    console.log(`User ${safeUserData.id} added successfully.`);
  } catch (error) {
    console.error('Detailed Recombee error:', error);
    throw error;
  }
};

// Function to set item values (song attributes, etc.) in Recombee
async function setItemValues(itemId, values, cascadeCreate = false) {
  try {
    console.log(`Setting values for item: ${itemId}`, values);

    // Define the SetItemValues request
    const setItemValuesRequest = new rqs.SetItemValues(itemId, values, { cascadeCreate });
    // Apply timeout to the SetItemValues request object
    setItemValuesRequest.timeout = TIMEOUT;

    // Send the request with timeout
    await client.send(setItemValuesRequest);

    console.log(`Values set successfully for item: ${itemId}`);
  } catch (error) {
    console.error(`Error setting values for item: ${itemId}`, error);
    throw error;
  }
}

// New function to add detail view (track song listen time, etc.)
async function addDetailView(userId, itemId, { timestamp, duration, cascadeCreate, recommId }) {
  try {
    console.log(`Adding detail view for User: ${userId}, Item: ${itemId}`);

    // Create an AddDetailView request with the optional parameters
    const addDetailViewRequest = new rqs.AddDetailView(userId, itemId, {
      timestamp,        // Optional: Timestamp for when the listen happened
      duration,         // Optional: Duration of the view (e.g., song listen time)
      cascadeCreate,    // Optional: Create the item if it doesn't exist
      recommId          // Optional: A recommendation ID, if available
    });
    // Apply timeout to the AddDetailView request object
    addDetailViewRequest.timeout = TIMEOUT;

    // Send the request with timeout
    await client.send(addDetailViewRequest);
    console.log('Detail view added successfully.');
  } catch (error) {
    console.error(`Error adding detail view for user ${userId} and item ${itemId}:`, error);
    throw error;
  }
}

// Function to set user values in Recombee
async function setUserValues(userId, values, cascadeCreate = false) {
  try {
    console.log(`Setting user values for userId: ${userId}`, values);

    // Define the SetUserValues request
    const setUserValuesRequest = new rqs.SetUserValues(
      userId.toString(),
      values,
      { cascadeCreate } // Cascade create option
    );

    // Apply timeout to the SetUserValues request object
    setUserValuesRequest.timeout = TIMEOUT;

    // Send the request with timeout
    await client.send(setUserValuesRequest);

    console.log(`User values set successfully for userId: ${userId}`);
  } catch (error) {
    console.error(`Error setting user values for userId: ${userId}`, error);
    throw error;
  }
}


// // Example usage
// async function exampleUserFlow() {
//   try {
//     // Example: Get or create a user
//     const userId = '22';
//     const userData = {
//       username: 'thewiz',
//       email: 'danpham566@gmail.com',
//       totalListenTime: 0
//     };
//     const values = {
//       username: 'thewiz',
//       email: 'danpham566@gmail.com',
//       totalListenTime: 0
//     };
//
//     await setUserValues(userId, values, true);
//
//     const userResult = await getUserFromRecombee(userId, userData);
//     console.log('Final User Result:', userResult);
//     console.log('Final User Result:', values);
//
//   } catch (error) {
//     console.error('Error in user flow:', error);
//   }
// }
//
// exampleUserFlow();

module.exports = { addUserToRecombee, getUserFromRecombee, setItemValues, addDetailView ,setUserValues};
