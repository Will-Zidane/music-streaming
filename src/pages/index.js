import React from "react";
import Playlist from "@/components/Playlist/Playlist";
import { useMusicContext } from "@/utils/MusicProvider";

const Home = () => {
  const {
    currentTrackIndex,
    originalData,
    handleTrackChange,
    isLoading,
    error
  } = useMusicContext();

  const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

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

  const handleTrackSelect = (index) => {
    handleTrackChange(index, originalData);
  };

  return (
    <div className="h-full">
      <Playlist
        playlist={originalData}
        currentTrackIndex={currentTrackIndex}
        onTrackSelect={handleTrackSelect}
        STRAPI_BASE_URL={STRAPI_BASE_URL}
      />
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: {
      title: 'Home',
      description: 'Browse and play your favorite music'
    }
  };
}

export default Home;