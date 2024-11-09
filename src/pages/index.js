import React, { useEffect, useState } from "react";
import Layout from "@/layout/Layout";
import Playlist from "@/components/Playlist/Playlist";
import { useMusicContext } from "@/components/MusicProvider/MusicProvider";

// Lấy URL Strapi từ biến môi trường
const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

const Home = () => {
  const { currentTrackIndex, handleTrackChange } = useMusicContext();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${STRAPI_BASE_URL}/api/songs?populate=*`);
        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }
        const data = await response.json();
        setSongs(data.data);  // Set data vào state
      } catch (error) {
        console.error('Error fetching songs:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="text-gray-400">Loading songs...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full">
        {/* Truyền STRAPI_BASE_URL xuống Playlist */}
        <Playlist
          playlist={songs}
          currentTrackIndex={currentTrackIndex}
          onTrackSelect={handleTrackChange}
          STRAPI_BASE_URL={STRAPI_BASE_URL}
        />
      </div>
    </Layout>
  );
};

export default Home;
