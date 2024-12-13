// utils/recombee.js
const recombee = require('recombee-api-client');
const rqs = recombee.requests;

const DATABASE_ID = process.env.RECOMBEE_DATABASE_ID;
const DATABASE_REGION = process.env.RECOMBEE_DATABASE_REGION;
const DATABASE_SECRET = process.env.RECOMBEE_PRIVATE_TOKEN;

// Client initialization
const client = new recombee.ApiClient(DATABASE_ID, DATABASE_SECRET, {
  region: DATABASE_REGION,
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
const addUserToRecombee = async (userData) => {
  try {
    console.log('Raw userData:', userData);
    // await defineUserProperties();

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


    console.log('Setting user values:', { username: safeUserData.username, email: safeUserData.email});

    // Define the SetUserValues request
    const setUserValuesRequest = new rqs.SetUserValues(
      safeUserData.id.toString(),
      {
        username: safeUserData.username,
        email: safeUserData.email,
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
async function addDetailView(userId, itemId, { timestamp, duration, cascadeCreate = false, recommId } = {}) {
  try {
    console.log(`Adding detail view for User: ${userId}, Item: ${itemId}`);

    // Tạo yêu cầu AddDetailView với các tham số tùy chọn
    const addDetailViewRequest = new rqs.AddDetailView(userId, itemId, {
      ...(timestamp && { timestamp }),   // Thêm nếu timestamp tồn tại
      ...(duration && { duration }),    // Thêm nếu duration tồn tại
      cascadeCreate,                    // Mặc định là false
      ...(recommId && { recommId })     // Thêm nếu recommId tồn tại
    });

    // Gắn timeout cho request
    addDetailViewRequest.timeout = TIMEOUT;

    // Gửi yêu cầu
    await client.send(addDetailViewRequest);
    console.log('Detail view added successfully.');
  } catch (error) {
    console.error(
      `Error adding detail view for user ${userId} and item ${itemId}:`,
      error.message || error
    );
    throw error;
  }
}


// Function to set user values in Recombee
async function setUserValues(userId, username, email) {
  try {
    console.log('Updating user:', { userId, username, email });

    // Check if the user exists in Recombee
    const userExists = await client
      .send(new rqs.GetUserValues(userId.toString()))
      .catch(() => null);

    if (!userExists) {
      console.error(`User with ID ${userId} does not exist.`);
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    // Prepare the values to update (username and email)
    const valuesToUpdate = {
      username: username || 'unknown',
      email: email || 'unknown@example.com'
    };

    // Define the SetUserValues request to update user details (username, email)
    const setUserValuesRequest = new rqs.SetUserValues(
      userId.toString(),
      valuesToUpdate,
      { cascadeCreate: false } // Assuming you don't want cascading creation on user data update
    );

    // Apply timeout to the SetUserValues request object
    setUserValuesRequest.timeout = TIMEOUT;

    // Send the request with timeout
    await client.send(setUserValuesRequest);

    console.log(`User ${userId} updated successfully with username: ${username} and email: ${email}`);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}


// Existing functions (like defineUserProperties, setUserValues, etc.)

// New function to recommend items to a user
async function recommendItemsToUser(userId, count, options = {}) {
  try {
    console.log(`Recommending ${count} items to user ${userId} with options:`, options);

    // Default parameters for RecommendItemsToUser request
    const recommendRequest = new rqs.RecommendItemsToUser(userId, count, {
      ...options, // Optional parameters
      cascadeCreate: options.cascadeCreate || false,
      returnProperties: options.returnProperties || false,
      includedProperties: options.includedProperties || [],
      filter: options.filter || '',
      booster: options.booster || '',
      logic: options.logic || {},
      minRelevance: options.minRelevance || '0',
      rotationRate: options.rotationRate || 0,
      rotationTime: options.rotationTime || 0,
    });

    // Apply timeout to the request object
    recommendRequest.timeout = TIMEOUT;

    // Send the request to get recommended items
    const response = await client.send(recommendRequest);
    console.log(`Successfully recommended ${count} items to user ${userId}:`);
    console.log(response);
    return response; // Return the response to handle further in your application
  } catch (error) {
    console.error(`Error recommending items to user ${userId}:`, error);
    console.error(error.response?.data || error.message);
    throw error; // Rethrow the error to handle it in higher levels
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

module.exports = { addUserToRecombee, getUserFromRecombee, setItemValues, addDetailView ,setUserValues, recommendItemsToUser};
