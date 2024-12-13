import React, { useEffect, useState } from "react";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { getFullUrl, formatDuration } from "@/components/Playlist/Playlist";
import Link from "next/link";

const Albums = ({
  album,
  currentTrackIndex,
  handleTrackChange,
  STRAPI_BASE_URL,
}) => {
  const [trackDurations, setTrackDurations] = useState({});

  useEffect(() => {
    if (album?.songs?.data) {
      loadTrackDurations(album.songs.data);
    }
  }, [album]);

  const loadTrackDurations = async (songs) => {
    const durations = {};
    for (let i = 0; i < songs.length; i++) {
      const track = songs[i];
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

  if (!album) return <div>Loading...</div>;

  return (
    <div className="h-full bg-gradient-to-b from-blue-800 to-blue-900 text-white">
      {/* Album Header */}
      <div className="flex items-center bg-gray-300 p-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden">
          <Image
            src={
              album.coverArt?.data?.attributes?.url
                ? `${STRAPI_BASE_URL}${album.coverArt.data.attributes.url}`
                : "/default-cover.jpg"
            }
            alt={album.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="ml-6">
          <h1 className="text-4xl font-bold">{album.name}</h1>
          <p className="text-text mt-2">
            Released by:{" "}
            <Link
              key={album.authors.data[0].id}
              href={`/artists/${album.authors.data[0].id}`}
              className={"hover:text-gray-200"}
            >
              {" "}
              {album.authors.data.length > 0
                ? album.authors.data[0].attributes.name
                : "Unknown"}{" "}
            </Link>
          </p>
        </div>
      </div>

      {/* Album Tracks */}
      <div className="bg-gray-900">
        <div className="space-y-1">
          {album.songs?.data?.map((track, index) => {
            const coverArtUrl =
              track?.attributes?.coverArt?.data?.attributes?.url;
            const duration = trackDurations[index];
            const artistName =
              track?.attributes?.authors?.data?.[0]?.attributes?.name ||
              "Unknown Artist";

            const isPlaying = index === currentTrackIndex; // Check if track is playing

            return (
              <div
                key={index}
                className={`grid grid-cols-[auto,3fr,2fr,1fr] gap-4 items-center px-8 py-4
                  hover:bg-gray-500 rounded-none cursor-pointer transition-colors ${
                    isPlaying ? "bg-gray-500" : "hover:bg-gray-500"
                  } rounded-none cursor-pointer transition-colors`}
                onClick={() => handleTrackChange(index, album.songs.data)}
              >
                <div className="relative w-6 flex items-center justify-center">
                  {isPlaying ? (
                    <PlayCircle className="text-green-500" size={24} />
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
                    <span className="font-normal truncate text-white">
                      {track?.attributes?.name || "Untitled Track"}
                    </span>
                    <span className="text-xs text-gray-400">{artistName}</span>
                  </div>
                </div>

                <div className="text-gray-400 truncate">
                  {track?.attributes?.album?.data?.attributes?.name ||
                    "No Album"}
                </div>

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

export default Albums;
