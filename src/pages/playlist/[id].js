import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMusicContext } from "@/utils/MusicProvider";
import Playlist from "@/components/Playlist/Playlist";

const PlaylistPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [playlist, setPlaylist] = useState([]);
  const [playlistTitle, setPlaylistTitle] = useState(""); // State for storing the playlist title

  const {
    currentTrackIndex,
    handleTrackChange,
    isPlaying,
    activePlaylist: currentPlaylist, // Use the correct context value for the current playlist
  } = useMusicContext();
  const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

  useEffect(() => {
    let isMounted = true;

    const fetchPlaylist = async () => {
      if (!id) return;

      try {
        const response = await fetch(
          `${STRAPI_BASE_URL}/api/playlists/${id}?populate[songs][populate]=coverArt,authors,album,src&populate[coverArt]=*`,
        );
        const data = await response.json();

        if (!isMounted) return;

        if (data.data) {
          const playlistTitle = data.data.attributes.title; // Extract the playlist title
          setPlaylistTitle(playlistTitle); // Set the playlist title to state
          const selectedPlaylist = data.data;
          const formattedTracks = selectedPlaylist.attributes.songs.data
            .map((song) => {
              console.log(song)
              return {
                id: song.id,
                attributes: {
                  name: song.attributes.name,
                  coverArt:
                    song.attributes.coverArt ||
                    selectedPlaylist.attributes.coverArt,
                  src: song.attributes.src,
                  listenTime: Number(song.attributes.listenTime || 0),

                  album: {
                    data: {
                      id: song.attributes.album?.data?.id || null, // Ensure album id is set properly
                      attributes: {
                        name:
                          song.attributes.album?.data?.attributes?.name ||
                          selectedPlaylist.attributes.title,
                      },
                    },
                  },
                  authors: {
                    data: song.attributes.authors?.data || [
                      {
                        attributes: {
                          name: selectedPlaylist.attributes.artist,
                        },
                      },
                    ],
                  },
                },
              };
            })
            .filter((track) => track.attributes); // Filter out tracks without src

          setPlaylist(formattedTracks);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching playlist:", error);
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
        isPlaying={isPlaying} // Pass the isPlaying value from context
        currentPlayingPlaylist={currentPlaylist} // Pass the current playlist from context
        playlistTitle={playlistTitle} // Pass the playlist title to the Playlist component
        playlistId={id} // Pass the playlist id to the Playlist component
      />
    </div>
  );
};

export default PlaylistPage;
