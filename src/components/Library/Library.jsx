import React, { useState, useEffect } from 'react';
import { Search, Plus, ArrowRight, X, Check } from 'lucide-react';
import { useRouter } from "next/router";
import { useAuth } from "@/utils/AuthContext";
const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;


const Library = () => {
  const [playlists, setPlaylists] = useState([]);
  const [playlistCounts, setPlaylistCounts] = useState({});

  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSongSelector, setShowSongSelector] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();




  const handlePlaylistClick = (playlistId) => {
    router.push(`/playlist/${playlistId}`).then();
  };

  const fetchSongs = async () => {
    try {
      const token = localStorage.getItem('strapiToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${STRAPI_BASE_URL}/api/songs?populate=*`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }

      const data = await response.json();
      setSongs(data.data);
      setFilteredSongs(data.data);
      setError(null); // Clear any existing errors if successful
    } catch (err) {
      console.error('Failed to fetch songs:', err);
      setError(err.message);
      setSongs([]);
      setFilteredSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;

    setShowModal(false);
    await fetchSongs();
    setShowSongSelector(true);
  };

  const handleSongSelection = (songId) => {
    setSelectedSongs(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const handleSearchSongs = (query) => {
    setSearchQuery(query);
    const filtered = songs.filter(song => {
      const name = song.attributes?.name || '';
      const artist = song.attributes?.authors?.data[0]?.attributes?.name || '';

      return (
        name.toLowerCase().includes(query.toLowerCase()) ||
        artist.toLowerCase().includes(query.toLowerCase())
      );
    });
    setFilteredSongs(filtered);
  };

  const handleFinishPlaylistCreation = async () => {
    if (selectedSongs.length === 0) {
      setError('Please select at least one song');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`${STRAPI_BASE_URL}/api/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            title: newPlaylistTitle.trim(),
            songs: selectedSongs
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create playlist');

      const data = await response.json();
      console.log('Created playlist:', data);
      setPlaylists(prev => [...prev, data.data]);

      // Reset states
      setShowSongSelector(false);
      setNewPlaylistTitle('');
      setSelectedSongs([]);
      setSearchQuery('');
      setFilteredSongs([]);

      // Redirect to new playlist
      router.push(`/playlist/${data.data.id}`);
    } catch (err) {
      console.error('Failed to create playlist:', err);
      setError('Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };



  const fetchUserPlaylists = async () => {
    const token = localStorage.getItem('strapiToken');

    if (!token) {
      console.error('No authentication token found.');
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      // First, get the user's data with their playlists
      const userResponse = await fetch(
        `${STRAPI_BASE_URL}/api/users/me?populate[playlists][populate][0]=songs&populate[playlists][populate][1]=coverArt`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      console.log('User data with playlists:', userData);

      // If the user has playlists, transform them into the expected format
      if (userData.playlists) {
        const formattedPlaylists = userData.playlists.map(playlist => ({
          id: playlist.id,
          attributes: {
            title: playlist.title,
            songs: {
              data: playlist.songs ? playlist.songs.map(song => ({
                id: song.id,
                attributes: {
                  name: song.name,
                  authors: {
                    data: song.authors || []
                  },
                  coverArt: song.coverArt ? {
                    data: {
                      attributes: {
                        url: song.coverArt.url
                      }
                    }
                  } : null
                }
              })) : []
            },
            coverArt: playlist.coverArt ? {
              data: {
                attributes: {
                  url: playlist.coverArt.url
                }
              }
            } : null
          }
        }));

        setPlaylists(formattedPlaylists);
      } else {
        setPlaylists([]);
      }
    } catch (err) {
      console.error('Playlist fetch error:', err);
      setError('Failed to load playlists');
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaylistSongCounts = async () => {
    try {
      const token = localStorage.getItem('strapiToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${STRAPI_BASE_URL}/api/songs?populate=playlists`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }

      const data = await response.json();

      // Create a count object for each playlist
      const counts = {};
      data.data.forEach(song => {
        song.attributes.playlists.data.forEach(playlist => {
          if (!counts[playlist.id]) {
            counts[playlist.id] = { count: 0 };
          }
          counts[playlist.id].count += 1;
        });
      });

      setPlaylistCounts(counts);
    } catch (err) {
      console.error('Error fetching song counts:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserPlaylists();
      fetchPlaylistSongCounts();
      fetchSongs();
    } else {
      setPlaylists([]);
      setSongs([]); // Clear songs when not authenticated
      setFilteredSongs([]); // Clear filtered songs
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);



  if (isLoading) return (
    <div className="h-full bg-black text-white">
      <div className="p-4 animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-3/4"></div>
        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
        <div className="h-4 bg-gray-800 rounded w-2/3"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="h-full bg-black text-white p-4">
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="h-full bg-black text-white flex flex-col">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {error}
        </div>
      )}

      {/* Name Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-neutral-900 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Name Your Playlist</h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:bg-neutral-800 p-1 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                placeholder="My Playlist"
                className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 mb-4 text-gray-100 placeholder:text-neutral-400 focus:outline-none focus:border-white"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistTitle.trim()}
                  className="px-4 py-2 rounded bg-green-500 text-black font-medium hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Song Selection Modal with Search */}
      {showSongSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-neutral-900 p-6 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Songs to "{newPlaylistTitle}"</h2>
              <button
                onClick={() => setShowSongSelector(false)}
                className="hover:bg-neutral-800 p-1 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchSongs(e.target.value)}
                placeholder="Search songs by title or artist"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-full pl-10 pr-4 py-2 text-gray-100 placeholder:text-neutral-400 focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px]">
              // Trong phần hiển thị song list
              {filteredSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => handleSongSelection(song.id)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-800/40 rounded-md cursor-pointer"
                >
                  <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    {song.attributes.coverArt?.data ? (
                      <img
                        // Thêm STRAPI_BASE_URL vào trước URL của ảnh
                        src={`${STRAPI_BASE_URL}${song.attributes.coverArt.data.attributes.url}`}
                        alt={song.attributes.name} // Đổi từ title thành name
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span>🎵</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{song.attributes.name}</div> {/* Đổi từ title thành name */}
                    <div className="text-sm text-gray-400">
                      {/* Hiển thị tên tác giả từ mảng authors */}
                      {song.attributes.authors?.data[0]?.attributes.name || 'Unknown Artist'}
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center">
                    {selectedSongs.includes(song.id) && <Check size={16} className="text-green-500" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {selectedSongs.length} songs selected
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSongSelector(false)}
                  className="px-4 py-2 rounded hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishPlaylistCreation}
                  disabled={selectedSongs.length === 0 || isCreating}
                  className="px-4 py-2 rounded bg-green-500 text-black font-medium hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create Playlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold">||</div>
            <h1 className="text-xl font-bold">Your Library</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-gray-800 rounded-full"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-full">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="px-4 py-1.5 bg-gray-800/40 hover:bg-gray-800 rounded-full text-sm font-medium">
            Playlists
          </button>
          <button className="px-4 py-1.5 bg-gray-800/40 hover:bg-gray-800 rounded-full text-sm font-medium">
            Artists
          </button>
          <button className="px-4 py-1.5 bg-gray-800/40 hover:bg-gray-800 rounded-full text-sm font-medium">
            Albums
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button className="p-2 hover:bg-gray-800 rounded-full">
            <Search size={20} />
          </button>
          <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white">
            <span>Recents</span>
            <span className="text-lg">☰</span>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => handlePlaylistClick(playlist.id)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-800/40 rounded-md cursor-pointer"
            >
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                {playlist.attributes.title === "Liked Songs" ? (
                  <div className="w-full h-full bg-gradient-to-br from-purple-700 via-purple-500 to-purple-400 flex items-center justify-center">
                    <span className="text-white text-2xl">♥️</span>
                  </div>
                ) : playlist.attributes.coverArt?.data ? (
                  <img
                    src={`${STRAPI_BASE_URL}${playlist.attributes.coverArt.data.attributes.url}`}
                    alt={playlist.attributes.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid grid-cols-2 grid-rows-2 bg-gray-800">
                    {[...Array(4)].map((_, index) => (
                      <img
                        key={index}
                        src="/music-streaming-icon.webp"
                        alt="Playlist cover"
                        className="w-full h-full object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white truncate">
                  {playlist.attributes.title}
                </div>
                <div className="text-sm text-gray-400 truncate">
                  Playlist • {playlistCounts[playlist.id]?.count || 0} songs
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Library;