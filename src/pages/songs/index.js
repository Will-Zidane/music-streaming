import React, { useEffect, useState } from "react";
import axios from "axios";

const SongPage = ({ songId }) => {
  const [songData, setSongData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the song data using axios
  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const response = await axios.get(`http://localhost:1337/api/songs/${songId}?populate=*`);
        setSongData(response.data.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch song data.");
        setIsLoading(false);
      }
    };

    fetchSongData();
  }, [songId]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const {
    name,
    album,
    authors,
    playlists,
    coverArt,
    src,
  } = songData.attributes;

  return (
    <div className="song-page">
      <h1>{name}</h1>

      {coverArt?.data && (
        <img
          src={`http://localhost:1337${coverArt.data.attributes.url}`}
          alt={name}
          width="300"
        />
      )}

      <p><strong>Album:</strong> {album?.data?.attributes?.name}</p>
      <p><strong>Artists:</strong> {authors?.data?.map(author => author.attributes.name).join(", ")}</p>
      <p><strong>Playlist:</strong> {playlists?.data?.map(playlist => playlist.attributes.title).join(", ")}</p>

      {src?.data && (
        <audio controls>
          <source
            src={`http://localhost:1337${src.data.attributes.url}`}
            type={src.data.attributes.mime}
          />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default SongPage;
