import React, { useEffect } from "react";
import Playlist from "@/components/Playlist/Playlist";
import { useMusicContext } from "@/components/MusicProvider/MusicProvider";

const Home = () => {
  const {
    currentTrackIndex,
    originalData,
    handleTrackChange,
    isLoading,
    error,
    resetToAllSongs,
    activePlaylist
  } = useMusicContext();

  const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

  // Reset to all songs when Home component mounts
  useEffect(() => {
    // Only reset if we're coming from a playlist (activePlaylist exists)
    if (activePlaylist) {
      resetToAllSongs();
    }
  }, []); // Empty dependency array means this runs once when component mounts

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">Loading songs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Playlist
        playlist={originalData}
        currentTrackIndex={currentTrackIndex}
        onTrackSelect={handleTrackChange}
        STRAPI_BASE_URL={STRAPI_BASE_URL}
      />
    </div>
  );
};

// Add metadata for the page
export async function getStaticProps() {
  return {
    props: {
      title: 'Home',
      description: 'Browse and play your favorite music'
    }
  };
}

export default Home;