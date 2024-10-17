import React, { useState, useEffect } from 'react';
import { Howl } from 'howler';

// Playlist data
export const playlistData = [
  {
    title: "Houdini",
    artist: "Eminem",
    url: "audio/y2meta.com - Eminem - Houdini [Official Music Video] (128 kbps).mp3",
  },
  {
    title: "See You Again",
    artist: "Charlie Puth ft. Wiz Khalifa",
    url: "/audio/y2meta.com - Wiz Khalifa - See You Again ft. Charlie Puth [Official Video] Furious 7 Soundtrack (128 kbps).mp3",
  },
];

const PlaylistComponent = ({ currentTrackIndex, setCurrentTrackIndex, isPlaying, setIsPlaying }) => {
  const [trackDurations, setTrackDurations] = useState({});



  useEffect(() => {
    playlistData.forEach((track, index) => {
      const sound = new Howl({
        src: [track.url],
        html5: true,
      });


      sound.once('load', () => {
        setTrackDurations(prevDurations => ({
          ...prevDurations,
          [index]: sound.duration()
        }));
      });
    });
  }, []);



  const handleTrackSelect = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const formatDuration = (duration) => {
    if (!duration && duration !== 0) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6">
      <table className="w-full">
        <thead>
        <tr className="text-left border-b border-gray-700">
          <th className="pb-2 text-gray-300">Title</th>
          <th className="pb-2 text-gray-300">Artist</th>
          <th className="pb-2 text-gray-300">Duration</th>
          <th className="pb-2 text-gray-300">Action</th>
        </tr>
        </thead>
        <tbody>
        {playlistData.map((track, index) => (
          <tr
            key={index}
            className={`border-b border-gray-700 hover:bg-emerald-700 
                  ${currentTrackIndex === index ? 'bg-emerald-700' : ''}`}
          >
            <td className="py-3 text-white">{track.title}</td>
            <td className="py-3 text-white">{track.artist}</td>
            <td className="py-3 text-white">{formatDuration(trackDurations[index])}</td>
            <td className="py-3">
              <button
                onClick={() => handleTrackSelect(index)}
                className="px-4 py-1 text-white hover:text-emerald-300"
              >
                {currentTrackIndex === index && isPlaying ? 'Playing' : 'Play'}
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlaylistComponent;