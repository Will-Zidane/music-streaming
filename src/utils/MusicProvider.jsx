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
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

        const formattedData = formatSongData(data.data);
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

  const formatSongData = (songs) => {
    return songs.map(song => ({
      title: song.attributes.name,
      artist: song.attributes.authors?.data?.length > 0
        ? song.attributes.authors.data
          .map(author => author.attributes.name)
          .join(", ")
        : 'Unknown Artist',
      album: song.attributes.album?.data?.attributes?.name || "Unknown Album",
      url: `${STRAPI_BASE_URL}${song.attributes.src.data.attributes.url}`,
      coverArt: song.attributes.coverArt?.data?.attributes?.url
        ? `${STRAPI_BASE_URL}${song.attributes.coverArt.data.attributes.url}`
        : "/default-cover.jpg"
    }));
  };


  const loadPlaylist = (playlist) => {
    const formattedPlaylist = playlist.map(song => {
      const songAttributes = song.attributes || {};
      return {
        title: songAttributes.name || 'Unknown Song',
        artist: songAttributes.authors?.data?.map(author => author.attributes.name).join(", ") || 'Unknown Artist',
        album: songAttributes.album?.data?.attributes?.name || "Unknown Album",
        url: `${STRAPI_BASE_URL}${songAttributes.src?.data?.attributes?.url || ''}`,
        coverArt: songAttributes.coverArt?.data?.attributes?.url
          ? `${STRAPI_BASE_URL}${songAttributes.coverArt.data.attributes.url}`
          : "/default-cover.jpg"
      };
    });
    setPlaylistData(formattedPlaylist);
    setActivePlaylist(formattedPlaylist);
  };

  const handleTrackChange = (index, playlist = null) => {
    if (playlist) {
      // Update playlist and play the selected track
      loadPlaylist(playlist);
      setCurrentTrackIndex(index);
      setCurrentPlayingTrack(playlist[index]);
    } else {
      // Change track in the current playlist
      setCurrentTrackIndex(index);
      setCurrentPlayingTrack(playlistData[index]);
    }
    setIsPlaying(true); // Start playing when track is changed
  };

  const resetToAllSongs = () => {
    const formattedData = formatSongData(originalData);
    setPlaylistData(formattedData);
    setActivePlaylist(null);
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrackIndex,
        playlistData,
        originalData,
        activePlaylist,
        currentPlayingTrack,
        handleTrackChange,
        loadPlaylist,
        resetToAllSongs,
        isLoading,
        error,
        isPlaying,
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