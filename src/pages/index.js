import React from "react";
import Layout from "@/layout/Layout";
import Playlist from "@/components/Playlist/Playlist";
import { useMusicContext } from '@/components/MusicProvider/MusicProvider';

const Home = () => {
  const { playlistData, currentTrackIndex, handleTrackChange } = useMusicContext();

  return (
    <Layout>
      <div className="h-full">
        <Playlist
          playlist={playlistData}
          currentTrackIndex={currentTrackIndex}
          onTrackSelect={handleTrackChange}
        />
      </div>
    </Layout>
  );
};

export default Home;