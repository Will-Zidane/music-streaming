import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

const SongPage = () => {
  const router = useRouter();
  const { id } = router.query;  // Access the songId from the URL. It should be 'id' not 'songId'

  const [songData, setSongData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wait for router to be ready before making the request
  useEffect(() => {
    console.log("Router query:", router.query);  // Log the full router query object
    console.log("id:", id);  // Log the id directly from router.query
    if (!router.isReady || !id) return; // Ensure id is available and router is ready

    const fetchSongData = async () => {
      setIsLoading(true);  // Start loading
      setError(null);  // Reset error state

      try {
        const response = await axios.get(`${STRAPI_BASE_URL}/api/songs/${id}?populate=*`);
        console.log('API Response:', response.data);  // Log the API response
        setSongData(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching song data:', err); // Log the error
        setError("Failed to fetch song data.");
        setIsLoading(false);
      }
    };

    fetchSongData();
  }, [router.isReady, id]);  // Dependency array includes id and router.isReady

  if (isLoading) return <div>Loading song details...</div>;
  if (error) return <div>{error}</div>;

  if (!songData || !songData.attributes) return <div>No song data available.</div>;

  const { name, album, authors, playlists, coverArt, src } = songData.attributes;

  return (
    <div className="song-page">
      <h1 className="text-2xl font-bold">{name}</h1>

      {/* Display cover image if available */}
      {coverArt?.data ? (
        <img
          className="w-64 h-64 object-cover mt-4"
          src={`${STRAPI_BASE_URL}${coverArt.data.attributes.url}`}
          alt={name}
        />
      ) : (
        <div>No cover art available</div>
      )}

      {/* Song details */}
      <div className="mt-4">
        <div className="text-lg font-semibold">Album: </div>
        <div>{album?.data?.attributes?.name || 'Unknown Album'}</div>
      </div>

      <div className="mt-4">
        <div className="text-lg font-semibold">Artists: </div>
        <div>{authors?.data?.map(author => author.attributes.name).join(", ") || 'Unknown Artist'}</div>
      </div>

      <div className="mt-4">
        <div className="text-lg font-semibold">Playlists: </div>
        <div>{playlists?.data?.map(playlist => playlist.attributes.title).join(", ") || 'No playlists'}</div>
      </div>


    </div>
  );
};

export default SongPage;
