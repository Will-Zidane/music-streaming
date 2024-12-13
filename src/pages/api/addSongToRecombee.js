const recombee = require('recombee-api-client');
const rqs = recombee.requests;

// Initialize Recombee client with your database ID, API token, region, and timeout setting
const client = new recombee.ApiClient('thewz-thewiz', 'ahi3VNWptGKy1nCAqhFyARS7fWS7WqhKUCWrXrzSu8A413LTETD9aiBLLCur8mfA', {
  region: 'us-west',
});

// Function to define properties for items in Recombee
async function defineItemProperties() {
  try {
    console.log('Defining item properties...');
    
    // Define the properties for the items
    await client.send(new rqs.AddItemProperty('name', 'string'));        // Song name property (string)
    await client.send(new rqs.AddItemProperty('listenTime', 'int'));      // Listen time property (int)
    await client.send(new rqs.AddItemProperty('coverArt', 'string'));    // Cover art URL property (string)
    await client.send(new rqs.AddItemProperty('authors', 'string'));     // Authors property (string)
    await client.send(new rqs.AddItemProperty('album', 'string'));       // Album name property (string)
    
    console.log('Properties defined successfully.');
  } catch (error) {
    console.error('Error defining item properties:', error);
    console.error('Detailed error:', error.response?.data || error.message);
  }
}

// Function to add an item to Recombee
function addItemToRecombee(songId, songName,listenTime, coverArtUrl, authors, albumName) {
  // Detailed logging of input data
  console.log('Preparing to add item to Recombee:', {
    songId,
    songName,
    listenTime,
    coverArtUrl,
    authors,
    albumName
  });

  // Comprehensive validation of input data
  if (!songId || !songName) {
    console.error(`Invalid song data. Song ID: ${songId}, Song Name: ${songName}`);
    return;
  }

  // Prepare the data for the Recombee API using SetItemValues
  const setItemValuesRequest = new rqs.SetItemValues(songId.toString(), {
    name: songName,
    listenTime: listenTime,
    coverArt: coverArtUrl || 'No Cover Art',
    authors: authors || 'Unknown Authors',
    album: albumName || 'Unknown Album',
  }, {
    cascadeCreate: true  // This will automatically create the item if it doesn't exist
  });

  // Set a timeout of 5 seconds
  setItemValuesRequest.timeout = 5000;

  // Send the request to Recombee with enhanced error handling
  client.send(setItemValuesRequest)
    .then(response => {
      console.log('Item added/updated successfully:', response);
    })
    .catch(error => {
      console.error('Error setting item values in Recombee:', error);
      console.error('Detailed error:', error.response?.data || error.message);
    });
}

// Function to delete an item from Recombee
async function deleteItemFromRecombee(itemId) {
  try {
    // Ensure the itemId is valid
    if (!itemId) {
      console.error('Invalid item ID');
      return;
    }

    // Send the DeleteItem request to Recombee
    const deleteItemRequest = new rqs.DeleteItem(itemId);

    // Send the request to the Recombee API
    await client.send(deleteItemRequest);
    console.log(`Item with ID ${itemId} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting item from Recombee:', error);
    console.error('Detailed error:', error.response?.data || error.message);
  }
}


// Fetch song data from Strapi API
const fetchDataFromStrapi = async () => {
  try {
    // Fetch song data from Strapi API with comprehensive populate parameters
    const response = await fetch('http://localhost:1337/api/songs?populate=*');
    
    // Validate API response
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Log full response for debugging
    console.log('Full Strapi Response:', JSON.stringify(data, null, 2));

    // Validate data structure
    if (!data || !data.data || data.data.length === 0) {
      console.error('No songs found in Strapi.');
      return;
    }

    // Process each song data with robust error handling
    data.data.forEach(song => {
      try {
        const songId = song.id;
        const songName = song.attributes?.name;
        const listenTime = song.attributes?.listenTime;

        // Validate song name
        if (!songName) {
          console.warn(`Song with ID ${songId} is missing a name, skipping.`);
          return;
        }

        if(!listenTime){
          console.warn(`Song with ID ${songId} is missing a listenTime, skipping.`);
          return;
        }

        // Safe extraction of cover art URL
        const coverArtUrl = song.attributes.coverArt?.data?.attributes?.url
          ? 'http://localhost:1337' + song.attributes.coverArt.data.attributes.url
          : null;

        // Safe extraction of authors
        const authors = song.attributes.authors?.data
          ?.map(author => author.attributes?.name)
          ?.filter(Boolean)  // Remove any null/undefined names
          ?.join(', ') || 'Unknown Author';

        // Safe extraction of album name
        const albumName = song.attributes.album?.data?.attributes?.name || 'Unknown Album';

        // Add to Recombee with comprehensive validation
        addItemToRecombee(
          songId, 
          songName,
          listenTime,
          coverArtUrl, 
          authors, 
          albumName
        );

      } catch (songProcessingError) {
        console.error(`Error processing song ${song.id}:`, songProcessingError);
      }
    });

  } catch (error) {
    console.error('Error fetching data from Strapi:', error);
    console.error('Detailed error:', error.message);
  }
};

// Main execution flow
async function main() {
  try {
    // Define item properties first
    await defineItemProperties();

    // Then fetch and add songs to Recombee
    await fetchDataFromStrapi();
  } catch (error) {
    console.error('Main execution error:', error);
  }
}

// Run the main function
main();