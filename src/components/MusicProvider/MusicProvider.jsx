import React, { createContext, useState, useContext, useEffect } from 'react';

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;
const MusicContext = createContext(undefined);

export function MusicProvider({ children }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlistData, setPlaylistData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${STRAPI_BASE_URL}/api/songs?populate=*`);

        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }

        const data = await response.json();
        setOriginalData(data.data);

        const formattedData = data.data.map(song => ({
          title: song.attributes.name,
          artist: song.attributes.authors.data
            .map(author => author.attributes.name)
            .join(", "),
          album: song.attributes.album?.data?.attributes?.name || "Unknown Album",
          url: `${STRAPI_BASE_URL}${song.attributes.src.data.attributes.url}`,
          coverArt: song.attributes.coverArt?.data?.attributes?.url
            ? `${STRAPI_BASE_URL}${song.attributes.coverArt.data.attributes.url}`
            : "/default-cover.jpg"
        }));

        setPlaylistData(formattedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching playlist:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, []);

  const setCurrentPlaylist = (playlist) => {
    const formattedPlaylist = playlist.map(song => {
      // Safeguard against undefined values
      const songAttributes = song.attributes || {};

      return {
        title: songAttributes.name || 'Unknown Song', // Default value if name is missing
        artist: songAttributes.authors?.data?.map(author => author.attributes.name).join(", ") || 'Unknown Artist', // Default value if no authors
        album: songAttributes.album?.data?.attributes?.name || "Unknown Album", // Default if album is missing
        url: `${STRAPI_BASE_URL}${songAttributes.src?.data?.attributes?.url || ''}`, // Safeguard against undefined src
        coverArt: songAttributes.coverArt?.data?.attributes?.url
          ? `${STRAPI_BASE_URL}${songAttributes.coverArt.data.attributes.url}`
          : "/default-cover.jpg"
      };
    });

    setPlaylistData(formattedPlaylist);
    setActivePlaylist(formattedPlaylist);
    setCurrentTrackIndex(0);
  };


  const handleTrackChange = (index) => {
    setCurrentTrackIndex(index);
  };

  const resetToAllSongs = () => {
    const formattedData = originalData.map(song => ({
      title: song.attributes.name,
      artist: song.attributes.authors.data
        .map(author => author.attributes.name)
        .join(", "),
      album: song.attributes.album?.data?.attributes?.name || "Unknown Album",
      url: `${STRAPI_BASE_URL}${song.attributes.src.data.attributes.url}`,
      coverArt: song.attributes.coverArt?.data?.attributes?.url
        ? `${STRAPI_BASE_URL}${song.attributes.coverArt.data.attributes.url}`
        : "/default-cover.jpg"
    }));

    setPlaylistData(formattedData);
    setActivePlaylist(null);
    setCurrentTrackIndex(0);
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrackIndex,
        playlistData,
        originalData,
        activePlaylist,
        handleTrackChange,
        setCurrentPlaylist,
        resetToAllSongs,
        isLoading,
        error
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicContext() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
}