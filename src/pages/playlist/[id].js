import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Playlist from '@/components/Playlist/Playlist';
import { useMusicContext } from '@/utils/MusicProvider';

const PlaylistPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [playlist, setPlaylist] = useState([]);
  const { currentTrackIndex, handleTrackChange } = useMusicContext();
  const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

  useEffect(() => {
    let isMounted = true;

    const fetchPlaylist = async () => {
      if (!id) return;

      try {
        const response = await fetch(
          `${STRAPI_BASE_URL}/api/playlists/${id}?populate[songs][populate]=coverArt,authors,album,src&populate[coverArt]=*`
        );
        const data = await response.json();

        if (!isMounted) return;

        if (data.data) {
          const selectedPlaylist = data.data;
          const formattedTracks = selectedPlaylist.attributes.songs.data.map(song => ({
            id: song.id,
            attributes: {
              name: song.attributes.name,
              coverArt: song.attributes.coverArt || selectedPlaylist.attributes.coverArt,
              src: song.attributes.src,
              album: {
                data: {
                  attributes: {
                    name: song.attributes.album?.data?.attributes?.name || selectedPlaylist.attributes.title
                  }
                }
              },
              authors: {
                data: song.attributes.authors?.data || [{
                  attributes: {
                    name: selectedPlaylist.attributes.artist
                  }
                }]
              }
            }
          }));

          setPlaylist(formattedTracks);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching playlist:', error);
        }
      }
    };

    fetchPlaylist();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleTrackSelect = (index) => {
    handleTrackChange(index, playlist);
  };

  return (
    <div className="h-full bg-gradient-to-b from-emerald-800 to-emerald-900">
      <Playlist
        playlist={playlist}
        currentTrackIndex={currentTrackIndex}
        onTrackSelect={handleTrackSelect}
        STRAPI_BASE_URL={STRAPI_BASE_URL}
      />
    </div>
  );
};

export default PlaylistPage;