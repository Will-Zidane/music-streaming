import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";



// Lấy URL Strapi từ biến môi trường
const getFullUrl = (relativePath, STRAPI_BASE_URL) => {
  if (!relativePath) return "/default-cover.jpg";  // Default nếu không có đường dẫn
  if (relativePath.startsWith("http")) return relativePath;  // Trường hợp đường dẫn đầy đủ đã có sẵn
  return `${STRAPI_BASE_URL}${relativePath}`;  // Dùng STRAPI_BASE_URL từ prop truyền vào
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const Playlist = ({ playlist, currentTrackIndex, onTrackSelect, STRAPI_BASE_URL }) => {
  const [trackStates, setTrackStates] = useState({});
  const [loadingTracks, setLoadingTracks] = useState(true);

  useEffect(() => {
    const loadTrackDurations = async () => {
      setLoadingTracks(true);
      const states = {};

      // Loop qua playlist và fetch các thông tin duration
      for (let i = 0; i < playlist.length; i++) {
        const track = playlist[i];
        const audioUrl = track?.attributes?.src?.data?.attributes?.url;

        if (!audioUrl) {
          states[i] = { duration: 0, error: "Missing audio source" };
          continue;
        }

        try {
          const audio = new Audio(getFullUrl(audioUrl, STRAPI_BASE_URL));
          await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error("Loading timeout"));
            }, 5000);

            audio.addEventListener("loadedmetadata", () => {
              clearTimeout(timeoutId);
              states[i] = { duration: audio.duration, error: null };
              resolve();
            });

            audio.addEventListener("error", () => {
              clearTimeout(timeoutId);
              reject(new Error("Failed to load audio"));
            });
          });
        } catch (error) {
          console.error(`Error loading duration for track ${i}:`, error);
          states[i] = {
            duration: 0,
            error: error.message === "Loading timeout"
              ? "Timeout loading audio"
              : "Failed to load audio"
          };
        }

        setTrackStates(prev => ({ ...prev, [i]: states[i] }));
      }

      setTrackStates(states);
      setLoadingTracks(false);
    };

    if (playlist.length > 0) {
      loadTrackDurations();
    }

    return () => {
      setTrackStates({});
      setLoadingTracks(false);
    };
  }, [playlist, STRAPI_BASE_URL]);

  if (playlist.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">
          No tracks found in the playlist
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gray-900 p-4">
        {loadingTracks && (
          <div className="text-gray-400 text-sm mb-4">
            Loading track information...
          </div>
        )}
        <div className="mt-2 space-y-1">
          {playlist.map((track, index) => {
            const trackState = trackStates[index] || { duration: 0, error: null };
            const coverArtUrl = track?.attributes?.coverArt?.data?.attributes?.url;

            return (
              <div
                key={index}
                className={`grid grid-cols-[auto,3fr,2fr,1fr,auto] gap-4 items-center p-4 hover:bg-gray-800/60 rounded-md group cursor-pointer transition-colors ${
                  currentTrackIndex === index ? "bg-gray-800/50" : ""
                }`}
                onClick={() => !trackState.error && onTrackSelect(index)}
              >
                <div className="text-gray-400 w-6">{index + 1}</div>

                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14">
                    <Image
                      src={getFullUrl(coverArtUrl, STRAPI_BASE_URL)}
                      alt={track?.attributes?.name || "Track cover"}
                      fill
                      className="rounded object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-normal">
                      {track?.attributes?.name || "Untitled Track"}
                    </span>
                    <span className="text-sm text-gray-400">
                      {track?.attributes?.authors?.data[0]?.attributes?.name || "Unknown Artist"}
                    </span>
                  </div>
                </div>

                <div className="text-gray-400">
                  {track?.attributes?.album?.data?.attributes?.name || "No Album"}
                </div>

                <div className="text-gray-400">
                  {trackState.error ? (
                    <span className="text-red-400 text-sm" title={trackState.error}>
                      Error
                    </span>
                  ) : (
                    trackState.duration ?
                      formatDuration(trackState.duration) :
                      "--:--"
                  )}
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
