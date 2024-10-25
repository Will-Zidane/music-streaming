import React, { createContext, useState, useContext } from 'react';

const MusicContext = createContext(undefined, undefined);

export function MusicProvider({ children }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const playlistData = [
    {
      title: "Houdini",
      artist: "Eminem",
      album: "The Death of Slim Shady",
      url: "audio/y2meta.com - Eminem - Houdini [Official Music Video] (128 kbps).mp3",
      coverArt: 'image/tdoss.jpeg'
    },
    {
      title: "See You Again",
      artist: "Charlie Puth ft. Wiz Khalifa",
      album: "Furious 7 Soundtrack",
      url: "audio/y2meta.com - Wiz Khalifa - See You Again ft. Charlie Puth [Official Video] Furious 7 Soundtrack (128 kbps).mp3",
      coverArt: 'image/see-you-again.jpeg'
    }
  ];

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