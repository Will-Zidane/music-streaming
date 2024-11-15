import React, { useState, useEffect } from 'react';
import { Search, Plus, ArrowRight, X } from 'lucide-react';
import { useRouter } from "next/router";
const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

const Library = () => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handlePlaylistClick = (playlistId) => {
    router.push(`/playlist/${playlistId}`).then();
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim() || isCreating) return;

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
            songs: []
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create playlist');

      const data = await response.json();
      setPlaylists(prev => [...prev, data.data]);
      setShowModal(false);
      setNewPlaylistTitle('');
    } catch (err) {
      console.error('Failed to create playlist:', err);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch(`${STRAPI_BASE_URL}/api/playlists?populate=*`);
        const data = await response.json();
        setPlaylists(data.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load playlists');
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

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
      {/* Show error message if there's an error */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {error}
        </div>
      )}
      {/* Create Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-neutral-900 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Playlist</h2>
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
                  disabled={!newPlaylistTitle.trim() || isCreating}
                  className="px-4 py-2 rounded bg-green-500 text-black font-medium hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
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

        {/* Rest of the component remains the same */}
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
          {/* Dynamic Playlists */}
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
                    src={playlist.attributes.coverArt.data.attributes.url}
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
                  Playlist • {playlist.attributes.songs?.data?.length || 0} songs
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