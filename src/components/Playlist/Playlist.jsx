import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const Playlist = ({ playlist, currentTrackIndex, onTrackSelect }) => {
  const [trackDurations, setTrackDurations] = useState({});

  useEffect(() => {
    const loadTrackDurations = async () => {
      const durations = {};

      for (let i = 0; i < playlist.length; i++) {
        const track = playlist[i];
        const audio = new Audio(track.url);

        try {
          await new Promise((resolve, reject) => {
            audio.addEventListener("loadedmetadata", () => {
              durations[i] = audio.duration;
              resolve();
            });
            audio.addEventListener("error", reject);
          });
        } catch (error) {
          console.error(`Error loading duration for track ${i}:`, error);
          durations[i] = 0;
        }
      }

      setTrackDurations(durations);
    };

    loadTrackDurations();
  }, [playlist]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gray-900  p-4">
        <div className="mt-2">
          {playlist.map((track, index) => (
            <div
              key={index}
              className={`grid grid-cols-[auto,3fr,2fr,1fr,auto] gap-4 items-center p-4 hover:bg-gray-300 rounded-md group cursor-pointer  active::text-green-100 ${
                currentTrackIndex === index ? "bg-gray-800/50" : ""
              }`}
              onClick={() => onTrackSelect(index)}
            >
              <div className="text-gray-400 w-6">{index + 1}</div>

              <div className="flex items-center gap-3">
                <img
                  src={track.coverArt}
                  alt={track.title}
                  className="w-14 h-14 rounded"
                />
                <div className="flex flex-col">
                  <span className="text-white font-normal">{track.title}</span>
                  <span className="text-sm text-gray-400">{track.artist}</span>
                </div>
              </div>

              <div className="text-gray-400">{track.album}</div>
              <div className="text-gray-400">
                {trackDurations[index]
                  ? formatDuration(trackDurations[index])
                  : "--:--"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Playlist;
