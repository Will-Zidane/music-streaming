import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const getFullUrl = (relativePath, STRAPI_BASE_URL) => {
  if (!relativePath) return "/default-cover.jpg";
  if (relativePath.startsWith("http")) return relativePath;
  if (relativePath.startsWith("/uploads")) {
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    const baseUrl = STRAPI_BASE_URL.endsWith('/')
      ? STRAPI_BASE_URL.slice(0, -1)
      : STRAPI_BASE_URL;
    return `${baseUrl}/${cleanPath}`;
  }
  return relativePath;
};

const transformTrackData = (track, STRAPI_BASE_URL) => {
  if (!track) return null;

  const coverArtUrl = track.attributes?.coverArt?.data?.attributes?.url;

  return {
    id: track.id,
    title: track.attributes?.name || "Untitled Track",
    artist: track.attributes?.authors?.data[0]?.attributes?.name || "Unknown Artist",
    album: track.attributes?.album?.data?.attributes?.name || "No Album",
    coverArt: getFullUrl(coverArtUrl, STRAPI_BASE_URL),
    url: getFullUrl(track.attributes?.src?.data?.attributes?.url, STRAPI_BASE_URL)
  };
};

const Playlist = ({ playlist = [], currentTrackIndex, onTrackSelect, STRAPI_BASE_URL }) => {
  const [trackStates, setTrackStates] = useState({});
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [transformedPlaylist, setTransformedPlaylist] = useState([]);

  useEffect(() => {
    const transformed = playlist.map(track => transformTrackData(track, STRAPI_BASE_URL));
    setTransformedPlaylist(transformed);
  }, [playlist, STRAPI_BASE_URL]);

  useEffect(() => {
    const loadTrackDurations = async () => {
      setLoadingTracks(true);
      const states = {};

      for (let i = 0; i < transformedPlaylist.length; i++) {
        const track = transformedPlaylist[i];
        if (!track?.url) {
          states[i] = { duration: 0, error: "Missing audio source" };
          continue;
        }

        try {
          const audio = new Audio(track.url);
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

    if (transformedPlaylist.length > 0) {
      loadTrackDurations();
    }

    return () => {
      setTrackStates({});
      setLoadingTracks(false);
    };
  }, [transformedPlaylist]);

  if (transformedPlaylist.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">
          No tracks found in the playlist
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 border-none">
      <div className="p-4">
        {loadingTracks && (
          <div className="text-gray-400 text-sm mb-4">
            Loading track information...
          </div>
        )}
        <div className="space-y-1">
          {transformedPlaylist.map((track, index) => {
            const trackState = trackStates[index] || { duration: 0, error: null };

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
                      src={track.coverArt}
                      alt={track.title}
                      fill
                      className="rounded object-cover"
                      onError={(e) => {
                        e.target.src = "/default-cover.jpg";
                      }}
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-normal">
                      {track.title}
                    </span>
                    <span className="text-sm text-gray-400">
                      {track.artist}
                    </span>
                  </div>
                </div>

                <div className="text-gray-400">
                  {track.album}
                </div>

                <div className="text-gray-400 flex items-center gap-2">
                  <Clock size={14} />
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