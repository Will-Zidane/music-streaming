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
          throw new Error("Failed to fetch playlist");
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
      songId: song.id, // Change to songId to make it explicit
      title: song.attributes.name,
      artist: song.attributes.authors?.data?.length > 0
        ? song.attributes.authors.data
          .map(author => author.attributes.name)
          .join(", ")
        : 'Unknown Artist',
      album: song.attributes.album?.data?.attributes?.name || "Unknown Album",
      url: `${STRAPI_BASE_URL}${song.attributes.src?.data?.attributes?.url}`,
      coverArt: song.attributes.coverArt?.data?.attributes?.url
        ? `${STRAPI_BASE_URL}${song.attributes.coverArt.data.attributes.url}`
        : "/default-cover.jpg"
    }));
  };



  const loadPlaylist = (playlist) => {
    console.log('Incoming playlist:', playlist);

    const formattedPlaylist = playlist.map(song => {
      console.log('Processing song:', song);
      const songAttributes = song.attributes || song || {};

      let coverArt;
      if (song.coverArt) {
        // If coverArt is directly provided
        coverArt = song.coverArt.startsWith('http')
          ? song.coverArt
          : `${STRAPI_BASE_URL}${song.coverArt}`;
      } else if (song.attributes?.coverArt?.data?.attributes?.url) {
        // If coverArt is nested in attributes
        coverArt = `${STRAPI_BASE_URL}${song.attributes.coverArt.data.attributes.url}`;
      } else {
        // Fallback to default cover
        coverArt = "/default-cover.jpg";
      }

      return {
        songId: song.id || songAttributes.id || songAttributes.songId,
        title: songAttributes.name || songAttributes.title || 'Unknown Song',
        artist: songAttributes.authors?.data?.map(author => author.attributes.name).join(", ")
          || songAttributes.artist
          || 'Unknown Artist',
        album: songAttributes.album?.data?.attributes?.name
          || songAttributes.album
          || "Unknown Album",
        url: `${STRAPI_BASE_URL}${songAttributes.src?.data?.attributes?.url || songAttributes.url || ''}`,
        coverArt: coverArt
      };
    });

    console.log('Formatted playlist URLs:', formattedPlaylist.map(item => item.url));
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
        setCurrentTrackIndex
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicContext() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicContext must be used within a DropdownAddToPlaylist');
  }
  return context;
}