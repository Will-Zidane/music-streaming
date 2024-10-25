import React, { useEffect, useState } from "react";
import Layout from "@/layout/Layout";
import Playlist from "@/components/Playlist/Playlist";
import { useMusicContext } from '@/components/MusicProvider/MusicProvider';
import { data } from "autoprefixer";

const Home = () => {
  const { playlistData, currentTrackIndex, handleTrackChange } = useMusicContext();
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch('http://localhost:1337/api/songs?populate=*');
        const data = await response.json();
        setSongs(data.data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchSongs();
  }, []);

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Danh sách bài hát</h1>
        {songs.map((song) => (
          <div key={song.id} className="mb-4 p-4 border rounded">
            <h2 className="font-bold">{song.attributes.title}</h2>
            <p>Album: {song.attributes.album.data.attributes.name}</p>
            <p>Ca sĩ: {song.attributes.authors.data[0].attributes.name}</p>
          </div>
        ))}
      </div>
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