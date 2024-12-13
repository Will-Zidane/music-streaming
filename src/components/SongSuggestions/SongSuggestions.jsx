import React, { useState, useEffect } from 'react';
import { RecombeeClient, AddRequest, RecommendItemsRequest } from 'recombee-api-client';

const RecombeeRecommendations = ({ userId, STRAPI_BASE_URL }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize Recombee client
  const client = new RecombeeClient(STRAPI_BASE_URL, 'your-api-key');  // Replace with actual API key

  // Function to get recommendations from Recombee
  const getRecommendations = async () => {
    setLoading(true);

    try {
      const response = await client.send(
        new RecommendItemsRequest(userId, 10, { filters: 'genre="Pop"' })
      );

      setRecommendations(response.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations: ", error);
      alert("Error fetching recommendations");
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommendations when the component mounts
  useEffect(() => {
    if (userId) {
      getRecommendations();
    }
  }, [userId]);

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  return (
    <div className="recommendations">
      <h2>Recommended Songs</h2>
      {recommendations.length > 0 ? (
        <div className="recommendation-list">
          {recommendations.map((song, index) => (
            <div key={index} className="recommendation-item">
              <img
                src={song.cover_image_url || '/default-cover.jpg'}
                alt={song.title}
                className="song-cover"
              />
              <div className="song-info">
                <h3>{song.title}</h3>
                <p>{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No recommendations available</p>
      )}
    </div>
  );
};

export default RecombeeRecommendations;
