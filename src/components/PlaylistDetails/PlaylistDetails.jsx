import React from 'react';
import { Clock, Play } from 'lucide-react';

const PlaylistDetails = ({ playlist }) => {
  if (!playlist) {
    return (
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-800 rounded"></div>
          <div className="h-8 bg-gray-800 rounded w-1/2"></div>
          <div className="h-4 bg-gray-800 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-black min-h-screen">
      {/* Header */}
      <div className="flex items-end space-x-6 p-8">
        <div className="w-52 h-52 shadow-lg">
          {playlist.attributes.coverArt?.data ? (
            <img
              src={playlist.attributes.coverArt.data.attributes.url}
              alt={playlist.attributes.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
              <span className="text-4xl">🎵</span>
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <span className="text-sm text-white">Playlist</span>
          <h1 className="text-5xl font-bold text-white">{playlist.attributes.title}</h1>
          <div className="text-sm text-gray-300 mt-4">
            <span>{playlist.attributes.artist}</span>
            <span> • </span>
            <span>{playlist.attributes.songs.data.length} songs</span>
          </div>
        </div>
      </div>

      {/* Play Button Section */}
      <div className="px-8 py-4">
        <button className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 transition-colors">
          <Play size={28} fill="black" className="ml-1" />
        </button>
      </div>

      {/* Songs List */}
      <div className="px-8">
        <div className="grid grid-cols-[auto,1fr,1fr,auto] gap-4 px-4 py-2 border-b border-gray-800 text-gray-400 text-sm">
          <div className="w-8">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="flex items-center">
            <Clock size={16} />
          </div>
        </div>

        <div className="mt-2">
          {playlist.attributes.songs.data.map((song, index) => (
            <div
              key={song.id}
              className="grid grid-cols-[auto,1fr,1fr,auto] gap-4 px-4 py-2 hover:bg-gray-800/50 rounded-md group"
            >
              <div className="w-8 text-gray-400 group-hover:text-white">
                {index + 1}
              </div>
              <div className="text-gray-300 group-hover:text-white">
                <div>{song.attributes.title}</div>
                <div className="text-sm text-gray-400">
                  {song.attributes.artist}
                </div>
              </div>
              <div className="text-gray-400">
                {song.attributes.album}
              </div>
              <div className="text-gray-400">
                {formatDuration(song.attributes.duration)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetails;