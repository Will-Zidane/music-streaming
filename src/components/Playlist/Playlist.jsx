import React, { useState, useEffect,useRef } from "react";
import Image from "next/image";
import { PlayCircle, Ellipsis, Trash2 } from "lucide-react";
import { useAuth } from "@/utils/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import AddSongsModal from "@/components/AddSongModal/AddSongModal";
export const getFullUrl = (relativePath, STRAPI_BASE_URL) => {
  if (!relativePath) return "/default-cover.jpg";
  if (relativePath.startsWith("http")) return relativePath;
  return `${STRAPI_BASE_URL}${relativePath}`;
};

export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const Playlist = ({
  playlist,
  currentTrackIndex,
  onTrackSelect,
  STRAPI_BASE_URL,
  isPlaying,
  currentPlayingPlaylist,
  playlistTitle,
  playlistId,
  refreshPlaylist, // New prop to refresh playlist after edit
}) => {


  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [trackDurations, setTrackDurations] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); // Tham chiếu tới dropdown
  const [hoveredTrackIndex, setHoveredTrackIndex] = useState(null);

  // Edit playlist states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: playlistTitle });

  // Delete playlist states
  const [isDeletionConfirmationOpen, setIsDeletionConfirmationOpen] =
    useState(false);
  const [deletionConfirmText, setDeletionConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // New state for track deletion
  const [isDeletingTrack, setIsDeletingTrack] = useState(false);

  const [isAddSongsModalOpen, setIsAddSongsModalOpen] = useState(false);

  // Hàm xử lý click bên ngoài dropdown
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false); // Ẩn dropdown nếu click bên ngoài
    }
  };

  useEffect(() => {
    // Lắng nghe sự kiện `mousedown`
    window.addEventListener("mousedown", handleClickOutside);

    // Cleanup listener khi component unmount
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // Load track durations
  const loadTrackDurations = async () => {
    const durations = {};

    for (let i = 0; i < playlist.length; i++) {
      const track = playlist[i];

      if (track?.attributes?.src?.data?.attributes?.url) {
        try {
          const audio = new Audio(
            getFullUrl(
              track.attributes.src.data.attributes.url,
              STRAPI_BASE_URL,
            ),
          );
          await new Promise((resolve) => {
            audio.addEventListener("loadedmetadata", () => {
              durations[i] = audio.duration;
              resolve();
            });
            audio.addEventListener("error", () => {
              durations[i] = null;
              resolve();
            });
          });
        } catch (error) {
          durations[i] = null;
        }
      }
    }

    setTrackDurations(durations);
  };

  useEffect(() => {
    loadTrackDurations();
  }, [playlist, STRAPI_BASE_URL]);

  // Edit playlist method
  const handleEditPlaylist = async () => {
    try {
      const response = await fetch(
        `${STRAPI_BASE_URL}/api/playlists/${playlistId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("strapiToken")}`,
          },
          body: JSON.stringify({ data: editData }),
        },
      );

      if (response.ok) {
        // Refresh playlist data
        if (refreshPlaylist) refreshPlaylist();
        setIsEditing(false);

        alert("Playlist updated successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to edit playlist:", errorData);
        alert(errorData.message || "Failed to update playlist");
      }
    } catch (error) {
      console.error("Error editing playlist:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  // Delete playlist method
  const confirmDeletePlaylist = async () => {
    // Validate deletion confirmation text
    if (
      deletionConfirmText.toLowerCase().trim() !==
      playlistTitle.toLowerCase().trim()
    ) {
      alert("Confirmation text does not match playlist title");
      return;
    }

    try {
      setIsDeleting(true);

      // Perform delete request
      const response = await fetch(
        `${STRAPI_BASE_URL}/api/playlists/${playlistId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("strapiToken")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        // Redirect or update UI after successful deletion
        router.push("/");
        alert("Playlist successfully deleted");
      } else {
        // Handle potential error responses
        const errorData = await response.json();
        console.error("Playlist deletion failed:", errorData);
        alert(
          errorData.message ||
            "Failed to delete the playlist. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
      alert("An unexpected error occurred. Please try again later.");
    } finally {
      setIsDeleting(false);
      setIsDeletionConfirmationOpen(false);
    }
  };

  // Existing methods...
  const isTrackPlaying = (track, index) => {
    if (!isPlaying || !currentPlayingPlaylist) return false;
    const currentPlayingTrack = currentPlayingPlaylist[currentTrackIndex];
    return (
      currentTrackIndex === index &&
      currentPlayingTrack?.title === track?.attributes?.name
    );
  };

  const handlePlayFirstTrack = () => {
    if (playlist.length > 0) {
      onTrackSelect(0);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  // Calculate total duration
  const totalDuration = Object.values(trackDurations).reduce(
    (total, duration) => {
      if (duration) total += duration;
      return total;
    },
    0,
  );

  if (playlist.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">No tracks found in the playlist</div>
      </div>
    );
  }

  const handleTrackDelete = async (trackId) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this track from the playlist?");
    if (!confirmDelete) return;

    try {
      // Direct update of playlist tracks
      const updateResponse = await fetch(
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
                disconnect: [{ id: trackId }]
              }
            }
          })
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to remove track from playlist");
      }

      // Refresh playlist data
      if (refreshPlaylist) {
        await refreshPlaylist();
      }
      alert("Track removed successfully");
    } catch (error) {
      console.error("Error removing track:", error);
      alert("Failed to remove track from playlist");
    }
  };


  return (
    <div className="h-full overflow-y-auto min-h-[690px]">
      {isAuthenticated && (
        <div className="bg-gray-300 rounded-sm">
          <div className="flex items-center gap-6">
            <div className="relative w-48 h-48">
              <Image
                src={
                  getFullUrl(
                    playlist[0]?.attributes?.coverArt?.data?.attributes?.url,
                    STRAPI_BASE_URL,
                  ) || "/default-cover.jpg"
                }
                alt={playlist[0]?.attributes?.name || "Playlist cover"}
                className="rounded-lg"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="flex-grow">
              {!isEditing ? (
                <>
                  <h1 className="text-4xl font-bold">{playlistTitle}</h1>
                  <p className="text-gray-400">
                    Playlist created by{" "}
                    <span className="text-white">
                      {user?.username || "Unknown User"}
                    </span>{" "}
                    •{" "}
                    <span className="text-gray-400">
                      Total Duration: {formatDuration(totalDuration)}
                    </span>
                  </p>
                </>
              ) : (
                <div>
                  <input
                    type="text"
                    className="w-full text-gray-300 px-4 py-2 rounded bg-gray-700 text-white placeholder:text-gray-200"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    placeholder={playlistTitle}
                  />
                  <button
                    className="bg-green-300 hover:bg-green-200 text-white px-4 py-2 mt-2 rounded"
                    onClick={handleEditPlaylist}
                  >
                    Save
                  </button>
                  <button
                    className="bg-red-100 hover:bg-red-200 text-white px-4 py-2 mt-2 rounded ml-2"
                    onClick={() => {
                      setEditData({ title: playlistTitle });
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 h-10 my-4 ml-6 flex items-center">
        <button
          className="text-green-300 inline-block p-2 rounded-full"
          onClick={handlePlayFirstTrack}
        >
          <PlayCircle />
        </button>
        <div className="relative ml-2">
          <button
            className="inline-block p-2 rounded-full"
            onClick={toggleDropdown}
          >
            <Ellipsis />
          </button>
          {showDropdown && (
            <div className="absolute top-8 shadow-md rounded-lg py-2 w-32 z-20"
                 ref={dropdownRef} // Gắn ref vào dropdown
            >
              <button
                className="block px-4 py-2 text-sm text-gray-700 bg-gray-500 hover:bg-gray-200 w-full text-left"
                onClick={() => {
                  setIsEditing(true);
                  setShowDropdown(false);
                }}
              >
                Edit Playlist
              </button>
              <button
                className="block px-4 py-2 text-sm  bg-gray-500 hover:bg-gray-200 w-full text-left"
                onClick={() => {
                  setIsDeletionConfirmationOpen(true);
                  setShowDropdown(false);
                }}
              >
                Delete Playlist
              </button>
              <button
                className="block px-4 py-2 text-sm bg-gray-500 hover:bg-gray-200 w-full text-left"
                onClick={() => {
                  setIsAddSongsModalOpen(true);
                  setShowDropdown(false);
                }}
              >
                Add Songs
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Deletion Confirmation Overlay */}
      {isDeletionConfirmationOpen && (
        <div className="fixed inset-0 bg-black-100 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-500 p-6 rounded-lg w-96">
            <h2 className="text-xl text-white font-bold mb-4 text-red-500 flex items-center">
              <Trash2 className="mr-2" /> Confirm Playlist Deletion
            </h2>
            <p className="text-white mb-4">
              To delete this playlist, type the playlist name:
              <span className="font-bold text-white"> "{playlistTitle}"</span>
            </p>
            <input
              type="text"
              value={deletionConfirmText}
              onChange={(e) => setDeletionConfirmText(e.target.value)}
              className="w-full text-gray-300 p-2 mb-4 bg-gray-700 text-white rounded"
              placeholder="Type playlist name to confirm"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-white rounded"
                onClick={() => setIsDeletionConfirmationOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-300 hover:bg-green-100 text-white rounded"
                onClick={confirmDeletePlaylist}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Playlist"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddSongsModal
        isOpen={isAddSongsModalOpen}
        onClose={() => setIsAddSongsModalOpen(false)}
        STRAPI_BASE_URL={STRAPI_BASE_URL}
        playlistId={playlistId}
        refreshPlaylist={refreshPlaylist}
        currentPlaylistSongs={playlist} // Pass the current playlist songs
      />

      {/* Track List Rendering Remains the Same as in Previous Implementation */}
      <div className="bg-gray-900">
        <div className="space-y-1 ">
          {playlist.map((track, index) => {
            const isCurrentlyPlaying = isTrackPlaying(track, index);
            const coverArtUrl =
              track?.attributes?.coverArt?.data?.attributes?.url;
            const duration = trackDurations[index];

            return (
              <div
                key={index}
                className={`relative grid grid-cols-[auto,3fr,2fr,1fr,auto] gap-4 items-center px-8 py-4
                  hover:bg-gray-500 rounded-none cursor-pointer transition-colors group
                  ${isCurrentlyPlaying ? "bg-gray-500" : currentTrackIndex === index ? "bg-gray-2999" : ""}`}
                onClick={() => onTrackSelect(index)}
                onMouseEnter={() => setHoveredTrackIndex(index)}
                onMouseLeave={() => setHoveredTrackIndex(null)}
              >
                <div className="relative w-6 flex items-center justify-center">
                  {hoveredTrackIndex === index || isCurrentlyPlaying ? (
                    <PlayCircle className="w-5 h-5 text-green-200" />
                  ) : (
                    <span className="text-gray-400">{index + 1}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <Image
                      src={getFullUrl(coverArtUrl, STRAPI_BASE_URL)}
                      alt={track?.attributes?.name || "Track cover"}
                      fill
                      className="rounded object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`font-normal truncate ${isCurrentlyPlaying ? "text-green-500" : "text-white"}`}
                    >
                      {track?.attributes?.name || "Untitled Track"}
                    </span>

                    <Link
                      href={`/artists/${track?.attributes?.authors?.data[0]?.id || "#"} `}
                      className={`hover:underline`}
                      onClick={(e) => e.stopPropagation()} // Prevent track selection
                    >
                      <span className="text-sm text-gray-400 truncate">
                        {track?.attributes?.authors?.data[0]?.attributes
                          ?.name || "Unknown Artist"}
                      </span>
                    </Link>
                  </div>
                </div>

                <div className=" text-white truncate">
                  {track?.attributes?.album?.data ? (
                    <Link
                      href={`/albums/${track.attributes.album.data.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-blue-400 hover:underline">
                        {track.attributes.album.data.attributes.name ||
                          "Unknown Album"}
                      </div>
                    </Link>
                  ) : (
                    "Unknown Album"
                  )}
                </div>

                <div className="text-gray-400 flex-shrink-0">
                  {duration ? formatDuration(duration) : "--:--"}
                </div>

                {/* Trash icon column */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent track selection
                      handleTrackDelete(track.id);
                    }}
                    className="text-red-500 hover:text-red-200 transition-colors"
                    title="Remove track from playlist"
                    disabled={isDeletingTrack}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Playlist;
