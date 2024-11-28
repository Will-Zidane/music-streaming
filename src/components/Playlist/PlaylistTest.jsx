import Image from "next/image";
import { PlayCircle, Clock } from "lucide-react";
import { useState } from "react";

const PlaylistTest = ({
                    playlist = [], // Ensure a default empty array
                    playlistTitle = "Untitled Playlist",
                    author = "Unknown",
                    duration = "0:00",
                  }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const formatDuration = (seconds) => {
    if (!seconds) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  console.log("Playlist data:", playlist); // Debugging the playlist prop

  if (!playlist || playlist.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        No tracks available in the playlist.
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      {/* Playlist Header */}
      <div className="flex items-center gap-6">
        <div className="relative w-36 h-36">
          <Image
            src={playlist[0]?.coverArt || "/default-cover.jpg"}
            alt="Playlist cover"
            className="rounded-lg"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold">{playlistTitle}</h1>
          <p className="text-gray-400">
            Playlist created by <span className="text-white">{author}</span> •{" "}
            {playlist.length} songs, {duration}
          </p>
        </div>
      </div>

      {/* Playlist Table */}
      <div className="mt-6">
        <div className="grid grid-cols-[auto,3fr,2fr,1fr] text-gray-400 px-8 py-4 border-b border-gray-700">
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <Clock className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          {playlist.map((track, index) => {
            const title = track?.title || "Untitled Track";
            const artist = track?.artist || "Unknown Artist";
            const album = track?.album || "No Album";
            const coverArt = track?.coverArt || "/default-cover.jpg";
            const trackDuration = track?.duration || 0;

            return (
              <div
                key={index}
                className={`grid grid-cols-[auto,3fr,2fr,1fr] items-center gap-4 px-8 py-3 rounded-lg transition-colors ${
                  hoveredIndex === index ? "bg-gray-800" : ""
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Track Number or Play Icon */}
                <div className="flex items-center justify-center">
                  {hoveredIndex === index ? (
                    <PlayCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Track Info */}
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={coverArt}
                      alt={title}
                      className="rounded object-cover"
                      layout="fill"
                    />
                  </div>
                  <div>
                    <p className="font-medium truncate">{title}</p>
                    <p className="text-sm text-gray-400">{artist}</p>
                  </div>
                </div>

                {/* Album Name */}
                <div className="truncate">{album}</div>

                {/* Track Duration */}
                <div>{formatDuration(trackDuration)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlaylistTest;

// Example Usage
export async function getServerSideProps() {
  // Mock data to ensure the component renders correctly
  const playlist = [
    {
      title: "Linh Cảm",
      artist: "Dabee, Kriss Ngo",
      album: "Linh Cảm",
      duration: 168,
      coverArt: "/default-cover.jpg", // Replace with a real URL
    },
    {
      title: "Như Anh Đã Thấy Em",
      artist: "PhucXp, Freak D",
      album: "Như Anh Đã Thấy Em",
      duration: 302,
      coverArt: "/default-cover.jpg",
    },
    // Add more tracks as needed
  ];

  return {
    props: {
      playlist,
      playlistTitle: "My recommendation playlist",
      author: "Dan Pham",
      duration: "34 min 15 sec",
    },
  };
}
