import React, { useState, useEffect } from "react";
import { Ellipsis, X, Check } from "lucide-react";
import { useAuth } from "@/utils/AuthContext";
import axios from "axios";

const DropdownAddToPlaylist = ({ songId }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [initialPlaylists, setInitialPlaylists] = useState([]); // Track the initial selected playlists
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      const token = localStorage.getItem("strapiToken");

      if (!token) {
        console.error("Token không tồn tại. Vui lòng đăng nhập.");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}/api/users/me?populate[playlists][populate][0]=songs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = response.data;
        const playlists = userData.playlists.map((playlist) => ({
          id: playlist.id,
          title: playlist.title,
          songs: playlist.songs,
          hasSong: playlist.songs.some((song) => song.id === songId),
        }));

        setPlaylists(playlists);
        const initialSelectedPlaylists = playlists.filter((p) => p.hasSong).map((p) => p.id);
        setSelectedPlaylists(initialSelectedPlaylists);
        setInitialPlaylists(initialSelectedPlaylists);  // Store the initial selected playlists
      } catch (err) {
        console.error("Lỗi lấy danh sách playlist của user:", err);
      }
    };

    fetchUserPlaylists();
  }, [songId]);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const openPlaylistModal = () => {
    setIsDropdownVisible(false);
    setIsPlaylistModalOpen(true);
  };

  const handleTogglePlaylist = (playlistId) => {
    setSelectedPlaylists((prev) =>
      prev.includes(playlistId)
        ? prev.filter((id) => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  const handleConfirmAddToPlaylists = async () => {
    const token = localStorage.getItem("strapiToken");

    if (!token) {
      setError("Vui lòng đăng nhập để thêm bài hát vào playlist");
      return;
    }

    try {
      setIsLoading(true);

      const addPromises = selectedPlaylists.map((playlistId) =>
        axios.put(
          `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}/api/playlists/${playlistId}`,
          {
            data: {
              songs: {
                connect: [{ id: songId }],
              },
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );

      const removePromises = playlists
        .filter((playlist) => !selectedPlaylists.includes(playlist.id))
        .map((playlist) =>
          axios.put(
            `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}/api/playlists/${playlist.id}`,
            {
              data: {
                songs: {
                  disconnect: [{ id: songId }],
                },
              },
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          )
        );

      await Promise.all([...addPromises, ...removePromises]);

      alert(`Cập nhật thành công!`);
      setIsPlaylistModalOpen(false);
    } catch (err) {
      console.error("Lỗi thêm bài hát vào playlist:", err);
      const errorMessage =
        err.response?.data?.error?.message || "Không thể cập nhật playlist";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isConfirmButtonDisabled = selectedPlaylists.length === 0 || isLoading || JSON.stringify(initialPlaylists) === JSON.stringify(selectedPlaylists);

  return (
    <div className="relative">
      <button
        className="inline-block p-2 rounded-full hover:bg-neutral-800 transition-colors"
        onClick={toggleDropdown}
      >
        <Ellipsis />
      </button>

      {isDropdownVisible && (
        <div className="absolute mt-2 w-48 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg z-10">
          <button
            className="w-full text-left px-4 py-2 hover:bg-neutral-700 transition-colors"
            onClick={openPlaylistModal}
          >
            Thêm vào playlist
          </button>
        </div>
      )}

      {isPlaylistModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-black-100 rounded-lg w-[500px] max-h-[90vh] flex flex-col">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsPlaylistModalOpen(false)}
                  className="hover:bg-neutral-800 p-1 rounded-full"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold">Thêm vào Playlist</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between p-3 bg-neutral-800 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-neutral-700 rounded flex items-center justify-center">
                      {playlist.coverImage ? (
                        <img
                          src={playlist.coverImage}
                          alt={playlist.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-neutral-400">🎵</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{playlist.title}</div>
                      <div className="text-sm text-neutral-400">
                        {playlist.songs?.length || 0} bài hát
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTogglePlaylist(playlist.id)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      selectedPlaylists.includes(playlist.id)
                        ? "bg-green-600 border-green-600"
                        : "border-neutral-600 hover:border-green-600"
                    }`}
                  >
                    {selectedPlaylists.includes(playlist.id) && (
                      <Check size={16} className="text-white" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-neutral-400">
                {selectedPlaylists.length} playlist được chọn
              </div>
              <button
                onClick={handleConfirmAddToPlaylists}
                disabled={isConfirmButtonDisabled}
                className="px-4 py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang thêm..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownAddToPlaylist;
