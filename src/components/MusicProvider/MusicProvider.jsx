import React, { createContext, useState, useContext, useEffect } from 'react';

const STRAPI_BASE_URL = "http://localhost:1337";
const MusicContext = createContext(undefined, undefined);

export function MusicProvider({ children }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlistData, setPlaylistData] = useState([]);

  useEffect(() => {
    // Fetch playlist data from Strapi
    async function fetchPlaylist() {
      try {
        const response = await fetch(`${STRAPI_BASE_URL}/api/songs?populate=src,coverArt,authors`);
        const data = await response.json();

        // Parse the fetched data to match the playlist structure
        const formattedData = data.data.map(song => ({
          title: song.attributes.name,
          artist: song.attributes.authors.data.map(author => author.attributes.name).join(", "),
          album: song.attributes.album ? song.attributes.album.data.attributes.title : "Unknown Album",
          url: `${STRAPI_BASE_URL}${song.attributes.src.data.attributes.url}`,
          coverArt: song.attributes.coverArt
            ? `${STRAPI_BASE_URL}${song.attributes.coverArt.data.attributes.url}`
            : "default_cover.jpg", // Provide a default cover if none exists
        }));

        setPlaylistData(formattedData);
      } catch (error) {
        console.error("Error fetching playlist data:", error);
      }
    }

    fetchPlaylist();
  }, []);

  const handleTrackChange = (index) => {
    setCurrentTrackIndex(index);
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrackIndex,
        playlistData,
        handleTrackChange
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicContext() {
  return useContext(MusicContext);
}
