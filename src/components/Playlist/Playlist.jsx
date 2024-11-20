import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Clock, PlayCircle } from "lucide-react";

const getFullUrl = (relativePath, STRAPI_BASE_URL) => {
  if (!relativePath) return "/default-cover.jpg";
  if (relativePath.startsWith("http")) return relativePath;
  return `${STRAPI_BASE_URL}${relativePath}`;
};

const formatDuration = (seconds) => {
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
                  }) => {
  const [trackDurations, setTrackDurations] = useState({});

  useEffect(() => {
    const loadTrackDurations = async () => {
      const durations = {};

      for (let i = 0; i < playlist.length; i++) {
        const track = playlist[i];
        if (track?.attributes?.src?.data?.attributes?.url) {
          try {
            const audio = new Audio(getFullUrl(track.attributes.src.data.attributes.url, STRAPI_BASE_URL));
            await new Promise((resolve) => {
              audio.addEventListener('loadedmetadata', () => {
                durations[i] = audio.duration;
                resolve();
              });
              audio.addEventListener('error', () => {
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

    loadTrackDurations();
  }, [playlist, STRAPI_BASE_URL]);

  const isTrackPlaying = (track, index) => {
    if (!isPlaying || !currentPlayingPlaylist) return false;
    const currentPlayingTrack = currentPlayingPlaylist[currentTrackIndex];
    return currentTrackIndex === index && currentPlayingTrack?.title === track?.attributes?.name;
  };

  if (playlist.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">No tracks found in the playlist</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gray-900">
        <div className="space-y-1">
          {playlist.map((track, index) => {
            const isCurrentlyPlaying = isTrackPlaying(track, index);
            const coverArtUrl = track?.attributes?.coverArt?.data?.attributes?.url;
            const duration = trackDurations[index];

            return (
              <div
                key={index}
                className={`grid grid-cols-[auto,3fr,2fr,1fr,auto] gap-4 items-center px-8 py-4
                  hover:bg-gray-800/60 rounded-none cursor-pointer transition-colors
                  ${isCurrentlyPlaying ? "bg-gray-800/80" : currentTrackIndex === index ? "bg-gray-800/50" : ""}`}
                onClick={() => onTrackSelect(index)}
              >
                <div className="relative w-6 flex items-center justify-center">
                  <span className="text-gray-400 group-hover:hidden">
                    {index + 1}
                  </span>
                  <span className="text-gray-400 hidden group-hover:block absolute">
                    {isCurrentlyPlaying ? (
                      <PlayCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <PlayCircle className="w-5 h-5" />
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <Image
                      src={getFullUrl(coverArtUrl, STRAPI_BASE_URL)}
                      alt={track?.attributes?.name || "Track cover"}
                      fill
                      className="rounded object-cover"
                    />
                    {isCurrentlyPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <PlayCircle className="w-8 h-8 text-green-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`font-normal truncate ${isCurrentlyPlaying ? 'text-green-500' : 'text-white'}`}>
                      {track?.attributes?.name || "Untitled Track"}
                    </span>
                    <span className="text-sm text-gray-400 truncate">
                      {track?.attributes?.authors?.data[0]?.attributes?.name || "Unknown Artist"}
                    </span>
                  </div>
                </div>

                <div className="text-gray-400 truncate">
                  {track?.attributes?.album?.data?.attributes?.name || "No Album"}
                </div>

                <div></div>

                <div className="text-gray-400 flex-shrink-0">
                  {duration ? formatDuration(duration) : "--:--"}
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