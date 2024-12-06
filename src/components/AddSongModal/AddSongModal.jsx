import React, { useState, useEffect } from "react";
import Image from "next/image";
import {  Search, X, Check } from "lucide-react";


const AddSongsModal = ({
                         isOpen,
                         onClose,
                         STRAPI_BASE_URL,
                         playlistId,
                         refreshPlaylist,
                         currentPlaylistSongs

                       }) => {
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all songs
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch(
          `${STRAPI_BASE_URL}/api/songs?populate=*`
        );
        const data = await response.json();

        if (data.data) {
          // Filter out songs already in the playlist
          const availableSongs = data.data.filter(song =>
            !currentPlaylistSongs.some(playlistSong =>
              playlistSong.id === song.id
            )
          );

          setSongs(availableSongs);
          setFilteredSongs(availableSongs);
        }
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    if (isOpen) {
      fetchSongs();
    }
  }, [isOpen, STRAPI_BASE_URL, currentPlaylistSongs]);

  // Search songs
  const handleSearchSongs = (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredSongs(songs);
      return;
    }

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

  // Toggle song selection
  const handleSongSelection = (songId) => {
    setSelectedSongs(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  // Add selected songs to playlist
  const handleAddSongsToPlaylist = async () => {
    if (selectedSongs.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${STRAPI_BASE_URL}/api/playlists/${playlistId}?populate=songs`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("strapiToken")}`,
          },
          body: JSON.stringify({
            data: {
              songs: {
                connect: selectedSongs.map(id => ({ id }))
              }
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add songs to playlist");
      }

      // Refresh playlist data
      if (refreshPlaylist) {
        await refreshPlaylist();
      }



      // Reset and close modal
      setSelectedSongs([]);
      setSearchQuery('');
      onClose();
      alert("Songs added to playlist successfully!");
    } catch (error) {
      console.error("Error adding songs:", error);
      alert("Failed to add songs to playlist");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black-100 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-500 w-[500px] h-[600px] rounded-lg flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded-full">
            <X size={20} className="text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">Add Songs to Playlist</h2>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchSongs(e.target.value)}
              placeholder="Search songs by title or artist"
              className="w-full bg-gray-700 border border-gray-600 rounded-full pl-10 pr-4 py-2 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery.trim() === '' ? (
            <div className="text-gray-400 text-center mt-4">
              Nhập từ khóa để tìm bài hát.
            </div>
          ) : (
            filteredSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => handleSongSelection(song.id)}
                className="flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer"
              >
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  {song.attributes.coverArt?.data ? (
                    <Image
                      src={`${STRAPI_BASE_URL}${song.attributes.coverArt.data.attributes.url}`}
                      alt={song.attributes.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <span>🎵</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{song.attributes.name}</div>
                  <div className="text-sm text-gray-400">
                    {song.attributes.authors?.data[0]?.attributes.name || "Unknown Artist"}
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center">
                  {selectedSongs.includes(song.id) && (
                    <Check size={16} className="text-green-500" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {selectedSongs.length} songs selected
          </div>
          <button
            onClick={handleAddSongsToPlaylist}
            disabled={selectedSongs.length === 0 || isLoading}
            className="px-4 py-2 rounded bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Adding..." : "Add to Playlist"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSongsModal;