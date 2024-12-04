import React, { useState, useEffect } from 'react';
import { Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/router';

const PlaylistManagementModal = ({
                                   playlist,
                                   playlistId,
                                   STRAPI_BASE_URL,
                                   onPlaylistUpdate,
                                   onPlaylistDelete
                                 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [availableSongs, setAvailableSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([...playlist]);
  const { user, token } = useAuth();
  const router = useRouter();

  // Fetch available songs when editing begins
  const fetchAvailableSongs = async () => {
    try {
      const response = await fetch(`${STRAPI_BASE_URL}/api/songs?populate=*`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      // Filter out songs already in the playlist
      const filteredSongs = data.data.filter(song =>
        !selectedSongs.some(selectedSong =>
          selectedSong.id === song.id ||
          selectedSong.attributes.name === song.attributes.name
        )
      );

      setAvailableSongs(filteredSongs);
    } catch (error) {
      console.error('Error fetching available songs:', error);
    }
  };

  const handleAddSong = (song) => {
    setSelectedSongs([...selectedSongs, song]);
    setAvailableSongs(availableSongs.filter(s => s.id !== song.id));
  };

  const handleRemoveSong = (songId) => {
    const removedSong = selectedSongs.find(song => song.id === songId);
    setSelectedSongs(selectedSongs.filter(song => song.id !== songId));
    setAvailableSongs([...availableSongs, removedSong]);
  };

  const handleUpdatePlaylist = async () => {
    try {
      const response = await fetch(`${STRAPI_BASE_URL}/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            songs: selectedSongs.map(song => song.id || song.attributes.id)
          }
        })
      });

      if (response.ok) {
        onPlaylistUpdate(selectedSongs);
        setIsEditing(false);
      } else {
        console.error('Failed to update playlist');
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      const response = await fetch(`${STRAPI_BASE_URL}/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onPlaylistDelete();
        router.push('/playlists');
      } else {
        console.error('Failed to delete playlist');
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 my-4"
          onClick={fetchAvailableSongs}
        >
          Playlist Management <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Playlist Management</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Current Playlist Songs */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Playlist</h3>
            <div className="space-y-2">
              {selectedSongs.map(song => (
                <div
                  key={song.id}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded"
                >
                  <span>{song.attributes?.name || song.name}</span>
                  <button
                    onClick={() => handleRemoveSong(song.id)}
                    className="text-red-500 hover:bg-red-100 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Available Songs */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Available Songs</h3>
            <div className="space-y-2">
              {availableSongs.map(song => (
                <div
                  key={song.id}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded"
                >
                  <span>{song.attributes?.name}</span>
                  <button
                    onClick={() => handleAddSong(song)}
                    className="text-green-500 hover:bg-green-100 p-1 rounded"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button
            variant="destructive"
            onClick={handleDeletePlaylist}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Playlist
          </Button>
          <Button
            onClick={handleUpdatePlaylist}
            disabled={selectedSongs.length === 0}
          >
            Update Playlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistManagementModal;